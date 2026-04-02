import StatusDot from './StatusDot';
import styles from './StatusPill.module.css';

const statusClass = {
  achieved: styles.achieved,
  'working on': styles.workingOn,
  'want to try': styles.wantToTry,
};

export default function StatusPill({ status, size = 'default' }) {
  return (
    <span
      className={[
        styles.pill,
        statusClass[status] ?? '',
        size === 'sm' ? styles.sm : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <StatusDot status={status} size={size === 'sm' ? 6 : 7} />
      {status}
    </span>
  );
}
