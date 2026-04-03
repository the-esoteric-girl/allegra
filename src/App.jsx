import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Library from './pages/Library';
import MoveDetail from './pages/MoveDetail';
import Combos from './pages/Combos';
import You from './pages/You';
import BottomNav from './components/BottomNav';
import LogModal from './components/LogModal';
import SessionPill from './components/SessionPill';

function App() {
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionEntries, setSessionEntries] = useState([]);
  const [sessionNotes, setSessionNotes] = useState('');

  function handleLogPress() {
    setIsMinimized(false);
    setIsLogOpen(true);
  }

  function handleMinimize() {
    setIsLogOpen(false);
    if (sessionEntries.length > 0) setIsMinimized(true);
  }

  function handleClose() {
    setIsLogOpen(false);
    setIsMinimized(false);
  }

  function handleSessionSaved() {
    setSessionEntries([]);
    setSessionNotes('');
    setIsLogOpen(false);
    setIsMinimized(false);
  }

  function handleDiscard() {
    setSessionEntries([]);
    setSessionNotes('');
    setIsMinimized(false);
    setIsLogOpen(false);
  }

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
      {isMinimized && !isLogOpen && (
        <SessionPill
          entryCount={sessionEntries.length}
          onExpand={handleLogPress}
          onDiscard={handleDiscard}
        />
      )}
      <BottomNav onLogPress={handleLogPress} />
      <LogModal
        isOpen={isLogOpen}
        onClose={handleClose}
        onMinimize={handleMinimize}
        onSaved={handleSessionSaved}
        onDiscard={handleDiscard}
        sessionEntries={sessionEntries}
        setSessionEntries={setSessionEntries}
        sessionNotes={sessionNotes}
        setSessionNotes={setSessionNotes}
      />
    </>
  );
}

export default App;
