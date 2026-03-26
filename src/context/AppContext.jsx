import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AppContext } from './appContextInstance';

export function AppProvider({ children }) {
  const [moves, setMoves] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('All');

  async function fetchMoves() {
    const { data, error } = await supabase
      .from('moves')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.error(error);
      setError(error);
    } else {
      setMoves(data);
    }
    setLoading(false);
  }

  async function loadSessions() {
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: false });
    if (sessionError) {
      console.error(sessionError);
      setError(sessionError);
      return;
    }
    const sessionIds = sessionData.map(s => s.id);
    const { data: entryData, error: entryError } = await supabase
      .from('session_entries')
      .select('*')
      .in('session_id', sessionIds);
    if (entryError) {
      console.error(entryError);
      setError(entryError);
      return;
    }
    const sessionsWithEntries = sessionData.map(session => ({
      ...session,
      entries: entryData.filter(e => e.session_id === session.id),
    }));
    setSessions(sessionsWithEntries);
  }

  useEffect(() => {
    async function load() {
      await Promise.all([fetchMoves(), loadSessions()]);
    }
    load();
  }, []);

  async function addMove({ name, aliases = [], status = 'want to try', parent_move_id = null }) {
    const { error } = await supabase
      .from('moves')
      .insert({ name, aliases, status, parent_move_id });
    if (error) {
      console.error(error);
      setError(error);
    } else {
      await fetchMoves();
    }
  }

  async function updateMove(id, updates) {
    console.log('[updateMove] moveId:', id);
    console.log('[updateMove] updates:', updates);
    const { data, error } = await supabase
      .from('moves')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) {
      console.error('[updateMove] error:', error);
      setError(error);
    } else {
      console.log('[updateMove] data returned:', data);
      await fetchMoves();
    }
  }

  async function deleteMove(id) {
    const { error } = await supabase
      .from('moves')
      .delete()
      .eq('id', id);
    if (error) {
      console.error(error);
      setError(error);
    } else {
      await fetchMoves();
    }
  }

  async function createSession(notes = '') {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('sessions')
      .insert({ date: today, notes })
      .select()
      .single();
    if (error) {
      console.error(error);
      setError(error);
      return null;
    }
    await loadSessions();
    return data;
  }

  async function addSessionEntry(sessionId, moveId, previousStatus, newStatus, notesAdded) {
    const { data, error } = await supabase
      .from('session_entries')
      .insert({ session_id: sessionId, move_id: moveId, previous_status: previousStatus, new_status: newStatus, notes_added: Boolean(notesAdded) })
      .select()
      .single();
    if (error) {
      console.error(error);
      setError(error);
      return null;
    }
    await loadSessions();
    return data;
  }

  async function deleteSessionEntry(sessionId, moveId) {
    const { error } = await supabase
      .from('session_entries')
      .delete()
      .eq('session_id', sessionId)
      .eq('move_id', moveId);
    if (error) {
      console.error(error);
      setError(error);
    } else {
      await loadSessions();
    }
  }

  async function deleteSession(id) {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);
    if (error) {
      console.error(error);
      setError(error);
    } else {
      await loadSessions();
    }
  }

  async function fetchMoveNotes(moveId) {
    const { data, error } = await supabase
      .from('move_notes')
      .select('*')
      .eq('move_id', moveId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      return [];
    }
    return data;
  }

  async function addMoveNote(moveId, text, sessionId = null) {
    const { data, error } = await supabase
      .from('move_notes')
      .insert({ move_id: moveId, text, session_id: sessionId })
      .select()
      .single();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  }

  async function deleteMoveNote(noteId) {
    const { error } = await supabase
      .from('move_notes')
      .delete()
      .eq('id', noteId);
    if (error) {
      console.error(error);
      return false;
    }
    return true;
  }

  return (
    <AppContext.Provider value={{
      moves, loading, error,
      addMove, updateMove, deleteMove,
      sessions, loadSessions,
      createSession, addSessionEntry, deleteSessionEntry, deleteSession,
      fetchMoveNotes, addMoveNote, deleteMoveNote,
      librarySearch, setLibrarySearch, libraryFilter, setLibraryFilter,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;
