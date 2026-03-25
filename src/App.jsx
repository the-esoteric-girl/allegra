import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Library from './pages/Library';
import MoveDetail from './pages/MoveDetail';
import Combos from './pages/Combos';
import You from './pages/You';
import BottomNav from './components/BottomNav';
import LogModal from './components/LogModal';

function App() {
  const [isLogOpen, setIsLogOpen] = useState(false);

  return (
    <>
      <div style={{ paddingBottom: 80 }}>
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/move/:id" element={<MoveDetail />} />
          <Route path="/combos" element={<Combos />} />
          <Route path="/you" element={<You />} />
        </Routes>
      </div>
      <BottomNav onLogPress={() => setIsLogOpen(true)} />
      <LogModal isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} />
    </>
  );
}

export default App;
