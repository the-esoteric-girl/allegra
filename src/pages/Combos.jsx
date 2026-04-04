import { useState } from 'react';
import { useApp } from '../context/useApp';
import { Button } from '../components/ui';
import ComboModal from '../components/ComboModal';
import styles from './Combos.module.css';

export default function Combos() {
  const { combos, moves } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const moveMap = Object.fromEntries(moves.map(m => [m.id, m]));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.pageTitle}>Combos</div>
        <div className={styles.subtitle}>Build your sequences</div>
      </div>

      <Button onClick={() => setIsModalOpen(true)} fullWidth>
        + New combo
      </Button>

      {combos.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyHeading}>No combos yet</p>
          <p className={styles.emptyBody}>
            Chain moves into sequences, save your favourite combos, and build class material from your own library.
          </p>
        </div>
      ) : (
        <div className={styles.comboList}>
          {combos.map(combo => {
            const comboMoves = (combo.move_ids || []).map(id => moveMap[id]).filter(Boolean);
            const displayName = combo.name || 'Untitled combo';
            return (
              <div key={combo.id} className={styles.comboCard}>
                <div className={styles.comboName}>{displayName}</div>
                <div className={styles.comboMeta}>
                  {comboMoves.length} move{comboMoves.length !== 1 ? 's' : ''}
                </div>
                {comboMoves.length > 0 && (
                  <div className={styles.comboPreview}>
                    {comboMoves.map(m => m.name).join(' → ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ComboModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
