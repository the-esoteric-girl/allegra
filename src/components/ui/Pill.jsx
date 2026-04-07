import styles from './Pill.module.css';
import { cn } from '../../lib/cn';

export default function Pill({ active, onClick, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(styles.pill, active ? styles.active : styles.inactive, className)}
    >
      {children}
    </button>
  );
}
