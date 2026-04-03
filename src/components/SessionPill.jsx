import { ChevronUp, Trash2 } from 'lucide-react';
import styles from './SessionPill.module.css';

export default function SessionPill({ entryCount, onExpand, onDiscard }) {
  return (
    <div className={styles.pill}>
      <button className={styles.expandBtn} onClick={onExpand} aria-label="Expand session">
        <ChevronUp size={18} strokeWidth={2} />
      </button>
      <div className={styles.info}>
        <div className={styles.titleRow}>
          <span className={styles.liveIndicator} />
          <span className={styles.title}>Session in progress</span>
        </div>
        <p className={styles.subtitle}>{entryCount} {entryCount === 1 ? 'move' : 'moves'}</p>
      </div>
      <button className={styles.discardBtn} onClick={onDiscard} aria-label="Discard session">
        <Trash2 size={18} strokeWidth={1.8} />
      </button>
    </div>
  );
}
