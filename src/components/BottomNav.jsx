import { NavLink } from 'react-router-dom';
import { BookOpen, PlusCircle, Layers, User } from 'lucide-react';
import styles from './BottomNav.module.css';

export default function BottomNav({ onLogPress }) {
  return (
    <nav className={styles.nav}>
      <NavLink to="/" end className={({ isActive }) => isActive ? styles.itemActive : styles.item}>
        {({ isActive }) => (
          <>
            <BookOpen size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span>Library</span>
          </>
        )}
      </NavLink>

      <button onClick={onLogPress} className={styles.item} data-testid="bottom-nav-log">
        <PlusCircle size={22} strokeWidth={1.8} />
        <span>Log</span>
      </button>

      <NavLink to="/combos" className={({ isActive }) => isActive ? styles.itemActive : styles.item}>
        {({ isActive }) => (
          <>
            <Layers size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span>Combos</span>
          </>
        )}
      </NavLink>

      <NavLink to="/you" className={({ isActive }) => isActive ? styles.itemActive : styles.item}>
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
