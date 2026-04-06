import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { Button, ComboCard } from '../components/ui';
import ComboModal from '../components/ComboModal';
import styles from './Combos.module.css';

export default function Combos() {
  const { combos, moves, loading } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.pageTitle}>Combos</div>
        <div className={styles.subtitle}>Build your sequences</div>
      </div>

      <Button onClick={() => setIsModalOpen(true)} fullWidth>
        + New combo
      </Button>

      {loading ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyBody}>Loading…</p>
        </div>
      ) : combos.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyHeading}>No combos yet</p>
          <p className={styles.emptyBody}>
            Chain moves into sequences, save your favourite combos, and build class material from your own library.
          </p>
        </div>
      ) : (
        <div className={styles.comboList}>
          {combos.map(combo => (
            <ComboCard
              key={combo.id}
              combo={combo}
              moves={moves}
              onClick={() => navigate(`/combos/${combo.id}`)}
            />
          ))}
        </div>
      )}

      <ComboModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
