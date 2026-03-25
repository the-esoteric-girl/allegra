import { NavLink } from 'react-router-dom';
import { BookOpen, PlusCircle, Layers, User } from 'lucide-react';

const navStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'white',
  borderTop: '1px solid #e0e0e0',
  display: 'flex',
  justifyContent: 'space-around',
  padding: '8px 0',
  zIndex: 100,
};

const itemStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
  fontSize: '12px',
  color: '#888',
  textDecoration: 'none',
  padding: '4px 16px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

const activeStyle = {
  ...itemStyle,
  color: '#111',
  fontWeight: 'bold',
};

export default function BottomNav({ onLogPress }) {
  return (
    <nav style={navStyle}>
      <NavLink to="/" end style={({ isActive }) => isActive ? activeStyle : itemStyle}>
        {({ isActive }) => (
          <>
            <BookOpen size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span>Library</span>
          </>
        )}
      </NavLink>

      <button onClick={onLogPress} style={itemStyle}>
        <PlusCircle size={22} strokeWidth={1.8} />
        <span>Log</span>
      </button>

      <NavLink to="/combos" style={({ isActive }) => isActive ? activeStyle : itemStyle}>
        {({ isActive }) => (
          <>
            <Layers size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span>Combos</span>
          </>
        )}
      </NavLink>

      <NavLink to="/you" style={({ isActive }) => isActive ? activeStyle : itemStyle}>
        {({ isActive }) => (
          <>
            <User size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span>You</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}
