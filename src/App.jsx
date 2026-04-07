import { useState } from 'react';
import { Routes, Route, useLocation, useOutlet } from 'react-router-dom';
import Library from './pages/Library';
import MoveDetail from './pages/MoveDetail';
import Combos from './pages/Combos';
import ComboDetail from './pages/ComboDetail';
import ComboEdit from './pages/ComboEdit';
import You from './pages/You';
import SessionDetail from './pages/SessionDetail';
import Auth from './pages/Auth';
import BottomNav from './components/BottomNav';
import LogModal from './components/LogModal';
import SessionPill from './components/SessionPill';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function ProtectedAppLayout() {
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionEntries, setSessionEntries] = useState([]);
  const [sessionNotes, setSessionNotes] = useState('');
  const outlet = useOutlet();
  const location = useLocation();

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
      <div className="appShell">
        <div
          key={location.pathname}
          className="pageTransition pageTransitionGeneric"
        >
          {outlet}
        </div>
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
        <Route path="/sessions/:id" element={<SessionDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
