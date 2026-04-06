import StatusDot from './StatusDot';
import styles from './StatusPill.module.css';

const statusClass = {
  none: styles.none,
  achieved: styles.achieved,
  'working on': styles.workingOn,
  'want to try': styles.wantToTry,
};

export default function StatusPill({ status, size = 'default' }) {
  const resolvedStatus = status || 'none';
  const label = status || 'No status';

  return (
    <span
      className={[
        styles.pill,
        statusClass[resolvedStatus] ?? '',
        size === 'sm' ? styles.sm : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <StatusDot status={resolvedStatus} size={size === 'sm' ? 6 : 7} />
      {label}
    </span>
  );
}
