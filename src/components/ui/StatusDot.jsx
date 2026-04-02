import styles from './StatusDot.module.css';

const colorClass = {
  achieved: styles.achieved,
  'working on': styles.workingOn,
  'want to try': styles.wantToTry,
};

export default function StatusDot({ status, size = 7 }) {
  return (
    <span
      className={`${styles.dot} ${colorClass[status] ?? ''}`}
      style={{ width: size, height: size }}
    />
  );
}
