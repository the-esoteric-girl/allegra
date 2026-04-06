import { useState } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Library from './pages/Library';
import MoveDetail from './pages/MoveDetail';
import Combos from './pages/Combos';
import ComboDetail from './pages/ComboDetail';
import ComboEdit from './pages/ComboEdit';
import You from './pages/You';
import Auth from './pages/Auth';
import BottomNav from './components/BottomNav';
import LogModal from './components/LogModal';
import SessionPill from './components/SessionPill';
import ProtectedRoute from './components/ProtectedRoute';

function ProtectedAppLayout() {
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
        <Outlet />
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

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route
        element={(
          <ProtectedRoute>
            <ProtectedAppLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/" element={<Library />} />
        <Route path="/move/:id" element={<MoveDetail />} />
        <Route path="/combos" element={<Combos />} />
        <Route path="/combos/:id" element={<ComboDetail />} />
        <Route path="/combos/:id/edit" element={<ComboEdit />} />
        <Route path="/you" element={<You />} />
      </Route>
    </Routes>
  );
}

export default App;
