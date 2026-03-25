import { Routes, Route } from 'react-router-dom';
import Library from './pages/Library';
import MoveDetail from './pages/MoveDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Library />} />
      <Route path="/move/:id" element={<MoveDetail />} />
    </Routes>
  );
}

export default App;
