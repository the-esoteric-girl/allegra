import { useApp } from './context/AppContext';

function App() {
  const { moves } = useApp();

  return (
    <div>
      <h1>Allegra</h1>
      <p>Moves loaded: {moves.length}</p>
    </div>
  );
}

export default App;
