import styles from './StatusDot.module.css';

const colorClass = {
  none: styles.none,
  achieved: styles.achieved,
  'working on': styles.workingOn,
  'want to try': styles.wantToTry,
};

export default function StatusDot({ status, size = 7 }) {
  const resolvedStatus = status || 'none';

  return (
    <span
      className={`${styles.dot} ${colorClass[resolvedStatus] ?? ''}`}
      style={{ width: size, height: size }}
    />
  );
}
