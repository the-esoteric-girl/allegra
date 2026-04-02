import styles from './Pill.module.css';

export default function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.pill} ${active ? styles.active : styles.inactive}`}
    >
      {children}
    </button>
  );
}
