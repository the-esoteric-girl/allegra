import { Layers, ChevronRight } from 'lucide-react';
import Card from './Card';
import styles from './ComboCard.module.css';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const isCurrentYear = date.getFullYear() === new Date().getFullYear();
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  if (!isCurrentYear) options.year = 'numeric';
  return date.toLocaleDateString('en-US', options);
}

export default function ComboCard({ combo, moves, onClick }) {
  const moveMap = Object.fromEntries(moves.map(m => [m.id, m]));
  const resolvedNames = (combo.move_ids || []).map(id => moveMap[id]?.name).filter(Boolean);
  const totalCount = (combo.move_ids || []).length;

  const displayChips = resolvedNames.slice(0, 5);
  const extraCount = resolvedNames.length - 5;
  const allChips = [
    ...displayChips.map(name => ({ type: 'move', name })),
    ...(extraCount > 0 ? [{ type: 'more', count: extraCount }] : []),
  ];

  return (
    <Card onClick={onClick}>
      <div className={styles.top}>
        <span className={styles.name}>{combo.name || 'Untitled combo'}</span>
        <span className={styles.date}>{formatDate(combo.created_at)}</span>
      </div>

      {allChips.length > 0 && (
        <div className={styles.chips}>
          {allChips.map((chip, i) => (
            <span key={i} className={styles.chipGroup}>
              {chip.type === 'move' ? (
                <span className={styles.chip}>{chip.name}</span>
              ) : (
                <span className={`${styles.chip} ${styles.chipMore}`}>+{chip.count} more</span>
              )}
              {i < allChips.length - 1 && <span className={styles.arrow}>→</span>}
            </span>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.moveCount}>
          <Layers size={16} />
          {totalCount} move{totalCount !== 1 ? 's' : ''}
        </span>
        <ChevronRight size={16} className={styles.chevron} />
      </div>
    </Card>
  );
}
