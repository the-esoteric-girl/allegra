import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { Button, ComboCard, Select, EmptyState } from '../components/ui';
import ComboModal from '../components/ComboModal';
import { sortCombos } from '../lib/comboListControls';
import styles from './Combos.module.css';

export default function Combos() {
  const { combos, moves, loading, combosSortBy, setCombosSortBy } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.pageTitle}>Combos</div>
        <div className={styles.subtitle}>Build your sequences</div>
      </div>

      <Button
        onClick={() => setIsModalOpen(true)}
        fullWidth
        leftIcon={<Plus size={16} />}
        data-testid="combos-new-button"
      >
        New combo
      </Button>

      {loading ? (
        <EmptyState body="Loading…" className={styles.emptyState} bodyClassName={styles.emptyBody} />
      ) : combos.length === 0 ? (
        <EmptyState
          title="No combos yet"
          body="Chain moves into sequences, save your favourite combos, and build class material from your own library."
          className={styles.emptyState}
          titleClassName={styles.emptyHeading}
          bodyClassName={styles.emptyBody}
        />
      ) : (
        <>
          <div className={styles.controls}>
            <span className={styles.comboCount}>
              {combos.length} combo{combos.length !== 1 ? 's' : ''}
            </span>
            <Select
              id="combos-sort"
              name="combos-sort"
              value={combosSortBy}
              onChange={e => setCombosSortBy(e.target.value)}
              options={[
                { value: 'created-desc', label: 'Newest' },
                { value: 'created-asc', label: 'Oldest' },
                { value: 'moves-desc', label: 'Most moves' },
                { value: 'moves-asc', label: 'Fewest moves' },
              ]}
              variant="sort"
            />
          </div>
          <div className={styles.comboList}>
            {sortCombos(combos, combosSortBy).map(combo => (
              <ComboCard
                key={combo.id}
                combo={combo}
                moves={moves}
                onClick={() => navigate(`/combos/${combo.id}`)}
              />
            ))}
          </div>
        </>
      )}

      <ComboModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
