import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

function App() {
  const [moves, setMoves] = useState([]);

  useEffect(() => {
    async function fetchMoves() {
      const { data, error } = await supabase.from('moves').select('*');
      if (error) {
        console.error(error);
      } else {
        setMoves(data);
      }
    }
    fetchMoves();
  }, []);

  return (
    <div>
      <h1>Allegra</h1>
      <p>Moves loaded: {moves.length}</p>
    </div>
  );
}

export default App;
