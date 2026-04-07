import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { Button, ComboCard, Select } from '../components/ui';
import ComboModal from '../components/ComboModal';
import styles from './Combos.module.css';

function sortCombos(list, sortBy) {
  return [...list].sort((a, b) => {
    switch (sortBy) {
      case 'created-asc': return a.created_at < b.created_at ? -1 : 1;
      case 'name-asc': return (a.name || '').localeCompare(b.name || '');
      case 'name-desc': return (b.name || '').localeCompare(a.name || '');
      case 'moves-desc': return (b.move_ids?.length ?? 0) - (a.move_ids?.length ?? 0);
      case 'moves-asc': return (a.move_ids?.length ?? 0) - (b.move_ids?.length ?? 0);
      case 'created-desc':
      default: return a.created_at > b.created_at ? -1 : 1;
    }
  });
}

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
              className={styles.sortSelect}
            >
              <option value="created-desc">Newest</option>
              <option value="created-asc">Oldest</option>
              <option value="moves-desc">Most moves</option>
              <option value="moves-asc">Fewest moves</option>
              <option value="name-asc">A → Z</option>
              <option value="name-desc">Z → A</option>
            </Select>
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
