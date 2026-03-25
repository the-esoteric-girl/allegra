import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AppContext } from './appContextInstance';

export function AppProvider({ children }) {
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    async function load() {
      await fetchMoves();
    }
    load();
  }, []);

  async function addMove({ name, aliases = [], status = 'want to try', notes = '', parent_move_id = null }) {
    const { error } = await supabase
      .from('moves')
      .insert({ name, aliases, status, notes, parent_move_id });
    if (error) {
      console.error(error);
      setError(error);
    } else {
      await fetchMoves();
    }
  }

  async function updateMove(id, updates) {
    const { error } = await supabase
      .from('moves')
      .update(updates)
      .eq('id', id);
    if (error) {
      console.error(error);
      setError(error);
    } else {
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

  return (
    <AppContext.Provider value={{ moves, loading, error, addMove, updateMove, deleteMove }}>
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;
