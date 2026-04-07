import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AppContext } from './appContextInstance';

const DEFAULT_STATUS = null;

function normalizeStatus(status) {
  if (status === '' || status === null || status === undefined) return null;
  return status;
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [moves, setMoves] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('All');
  const [combosSortBy, setCombosSortBy] = useState('created-desc');

  async function getCurrentUserId() {
    if (user?.id) return user.id;

    const { data, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error(authError);
      setError(authError);
      return null;
    }

    const nextUser = data?.user ?? null;
    setUser(nextUser);
    return nextUser?.id ?? null;
  }

  async function signIn(email, password) {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error(signInError);
      setError(signInError);
      return { data: null, error: signInError };
    }

    return { data, error: null };
  }

  async function signUp(email, password, username) {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error(signUpError);
      setError(signUpError);
      return { data: null, error: signUpError };
    }

    const userId = data?.user?.id ?? data?.session?.user?.id;

    if (userId && username) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', userId);

      if (profileError) {
        console.error(profileError);
        setError(profileError);
        return { data: null, error: profileError };
      }
    }

    return { data, error: null };
  }

  async function signOut() {
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error(signOutError);
      setError(signOutError);
      return { error: signOutError };
    }

    return { error: null };
  }

  async function fetchMoves(userIdOverride) {
    const currentUserId = userIdOverride !== undefined
      ? userIdOverride
      : await getCurrentUserId();

    const { data: moveRows, error: moveError } = await supabase
      .from('moves')
      .select('*')
      .order('name', { ascending: true });

    if (moveError) {
      console.error(moveError);
      setError(moveError);
      setMoves([]);
      return;
    }

    const moveIds = (moveRows || []).map((move) => move.id);
    let userDataMap = {};

    if (currentUserId && moveIds.length > 0) {
      const { data: userMoveRows, error: userMoveError } = await supabase
        .from('user_move_data')
        .select('move_id, status, note')
        .eq('user_id', currentUserId)
        .in('move_id', moveIds);

      if (userMoveError) {
        console.error(userMoveError);
        setError(userMoveError);
      } else {
        userDataMap = Object.fromEntries(
          userMoveRows.map((row) => [row.move_id, row])
        );
      }
    }

    const mergedMoves = (moveRows || []).map((move) => ({
      ...move,
      status: userDataMap[move.id]?.status ?? DEFAULT_STATUS,
      note: userDataMap[move.id]?.note ?? null,
    }));

    setMoves(mergedMoves);
  }

  async function loadSessions(userIdOverride) {
    const currentUserId = userIdOverride !== undefined
      ? userIdOverride
      : await getCurrentUserId();

    if (!currentUserId) {
      setSessions([]);
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', currentUserId)
      .order('date', { ascending: false });

    if (sessionError) {
      console.error(sessionError);
      setError(sessionError);
      setSessions([]);
      return;
    }

    if (!sessionData || sessionData.length === 0) {
      setSessions([]);
      return;
    }

    const sessionIds = sessionData.map((session) => session.id);

    const { data: entryData, error: entryError } = await supabase
      .from('session_entries')
      .select('*')
      .eq('user_id', currentUserId)
      .in('session_id', sessionIds);

    if (entryError) {
      console.error(entryError);
      setError(entryError);
      return;
    }

    const sessionsWithEntries = sessionData.map((session) => ({
      ...session,
      entries: (entryData || []).filter((entry) => entry.session_id === session.id),
    }));

    setSessions(sessionsWithEntries);
  }

  async function loadCombos(userIdOverride) {
    const currentUserId = userIdOverride !== undefined
      ? userIdOverride
      : await getCurrentUserId();

    if (!currentUserId) {
      setCombos([]);
      return;
    }

    const { data, error: comboError } = await supabase
      .from('combos')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });

    if (comboError) {
      console.error(comboError);
      setError(comboError);
      setCombos([]);
      return;
    }

    setCombos(data || []);
  }

  async function refreshAllData(userIdOverride) {
    setLoading(true);
    await Promise.all([
      fetchMoves(userIdOverride),
      loadSessions(userIdOverride),
      loadCombos(userIdOverride),
    ]);
    setLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function boot() {
      const { data, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error(authError);
        setError(authError);
      }

      if (!isMounted) return;

      const nextUser = data?.user ?? null;
      setUser(nextUser);
      await refreshAllData(nextUser?.id ?? null);
    }

    boot();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      refreshAllData(nextUser?.id ?? null);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function createCombo(name, moveIds, notes) {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      const noUserError = new Error('You need to be signed in to create a combo.');
      setError(noUserError);
      return { data: null, error: noUserError };
    }

    const { data, error: comboError } = await supabase
      .from('combos')
      .insert([{
        user_id: currentUserId,
        name: name || null,
        move_ids: moveIds,
        notes: notes || null,
      }])
      .select()
      .single();

    if (comboError) {
      console.error(comboError);
      setError(comboError);
      return { data: null, error: comboError };
    }

    await loadCombos(currentUserId);
    return { data, error: null };
  }

  async function updateCombo(id, updates) {
    const { data, error: comboError } = await supabase
      .from('combos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (comboError) {
      console.error(comboError);
      setError(comboError);
      return { data: null, error: comboError };
    }

    await loadCombos();
    return { data, error: null };
  }

  async function deleteCombo(id) {
    const { error: comboError } = await supabase
      .from('combos')
      .delete()
      .eq('id', id);

    if (comboError) {
      console.error(comboError);
      setError(comboError);
      return { error: comboError };
    }

    await loadCombos();
    return { error: null };
  }

  async function addMove({
    name,
    aliases = [],
    status = DEFAULT_STATUS,
    parent_move_id = null,
    user_id = null,
  }) {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      const noUserError = new Error('You need to be signed in to add a move.');
      setError(noUserError);
      return null;
    }

    const ownerId = user_id ?? currentUserId;

    const normalizedStatus = normalizeStatus(status);

    const { data: moveRow, error: moveError } = await supabase
      .from('moves')
      .insert({
        name,
        aliases,
        parent_move_id,
        user_id: ownerId,
      })
      .select()
      .single();

    if (moveError) {
      console.error(moveError);
      setError(moveError);
      return null;
    }

    if (normalizedStatus !== null) {
      const { error: userMoveError } = await supabase
        .from('user_move_data')
        .upsert({
          user_id: currentUserId,
          move_id: moveRow.id,
          status: normalizedStatus,
          note: null,
        }, { onConflict: 'user_id,move_id' });

      if (userMoveError) {
        console.error(userMoveError);
        setError(userMoveError);
        return null;
      }
    }

    await fetchMoves(currentUserId);
    return { ...moveRow, status: normalizedStatus, note: null };
  }

  async function updateMove(id, updates) {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      const noUserError = new Error('You need to be signed in to update a move.');
      setError(noUserError);
      return false;
    }

    const { status, note, ...moveUpdates } = updates || {};
    const normalizedStatus = normalizeStatus(status);

    if (Object.keys(moveUpdates).length > 0) {
      const { error: moveError } = await supabase
        .from('moves')
        .update(moveUpdates)
        .eq('id', id);

      if (moveError) {
        console.error(moveError);
        setError(moveError);
        return false;
      }
    }

    if (status !== undefined || note !== undefined) {
      const existingMove = moves.find((move) => move.id === id);
      const resolvedStatus =
        status !== undefined
          ? normalizedStatus
          : normalizeStatus(existingMove?.status);
      const resolvedNote =
        note !== undefined
          ? note ?? null
          : existingMove?.note ?? null;

      if (resolvedStatus === null && !resolvedNote) {
        const { error: deleteUserMoveError } = await supabase
          .from('user_move_data')
          .delete()
          .eq('user_id', currentUserId)
          .eq('move_id', id);

        if (deleteUserMoveError) {
          console.error(deleteUserMoveError);
          setError(deleteUserMoveError);
          return false;
        }
      } else {
        const upsertPayload = {
          user_id: currentUserId,
          move_id: id,
          status: resolvedStatus,
          note: resolvedNote,
        };

        const { error: userMoveError } = await supabase
          .from('user_move_data')
          .upsert(upsertPayload, { onConflict: 'user_id,move_id' });

        if (userMoveError) {
          console.error(userMoveError);
          setError(userMoveError);
          return false;
        }
      }
    }

    await fetchMoves(currentUserId);
    return true;
  }

  async function deleteMove(id) {
    const { error: moveError } = await supabase
      .from('moves')
      .delete()
      .eq('id', id);

    if (moveError) {
      console.error(moveError);
      setError(moveError);
      return false;
    }

    await fetchMoves();
    return true;
  }

  async function createSession(notes = '') {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      const noUserError = new Error('You need to be signed in to create a session.');
      setError(noUserError);
      return null;
    }

    const today = new Date().toISOString().slice(0, 10);

    const { data, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: currentUserId,
        date: today,
        notes,
      })
      .select()
      .single();

    if (sessionError) {
      console.error(sessionError);
      setError(sessionError);
      return null;
    }

    await loadSessions(currentUserId);
    return data;
  }

  async function addSessionEntry(sessionId, moveId, previousStatus, newStatus, notesAdded) {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      const noUserError = new Error('You need to be signed in to add a session entry.');
      setError(noUserError);
      return null;
    }

    const { data, error: entryError } = await supabase
      .from('session_entries')
      .insert({
        user_id: currentUserId,
        session_id: sessionId,
        move_id: moveId,
        previous_status: previousStatus,
        new_status: newStatus,
        notes_added: Boolean(notesAdded),
      })
      .select()
      .single();

    if (entryError) {
      console.error(entryError);
      setError(entryError);
      return null;
    }

    await loadSessions(currentUserId);
    return data;
  }

  async function deleteSessionEntry(sessionId, moveId) {
    const { error: entryError } = await supabase
      .from('session_entries')
      .delete()
      .eq('session_id', sessionId)
      .eq('move_id', moveId);

    if (entryError) {
      console.error(entryError);
      setError(entryError);
      return;
    }

    await loadSessions();
  }

  async function updateSession(id, updates) {
    const { data, error: sessionError } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (sessionError) {
      console.error(sessionError);
      setError(sessionError);
      return { data: null, error: sessionError };
    }

    await loadSessions();
    return { data, error: null };
  }

  async function deleteSession(id) {
    const { error: sessionError } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    if (sessionError) {
      console.error(sessionError);
      setError(sessionError);
      return;
    }

    await loadSessions();
  }

  return (
    <AppContext.Provider value={{
      user,
      moves,
      sessions,
      combos,
      loading,
      error,
      addMove,
      updateMove,
      deleteMove,
      loadSessions,
      createSession,
      addSessionEntry,
      deleteSessionEntry,
      updateSession,
      deleteSession,
      loadCombos,
      createCombo,
      updateCombo,
      deleteCombo,
      signIn,
      signUp,
      signOut,
      librarySearch,
      setLibrarySearch,
      libraryFilter,
      setLibraryFilter,
      combosSortBy,
      setCombosSortBy,
    }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;
