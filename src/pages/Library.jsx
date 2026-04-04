import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { Pill, StatusPill } from '../components/ui';
import styles from './Library.module.css';

const STATUS_FILTERS = ['All', 'Achieved', 'Working On', 'Want To Try'];

export default function Library() {
  const { moves, librarySearch: search, setLibrarySearch: setSearch, libraryFilter: statusFilter, setLibraryFilter: setStatusFilter } = useApp();
  const navigate = useNavigate();

  const filtered = moves.filter((move) => {
    const query = search.toLowerCase();
    const matchesSearch =
      move.name.toLowerCase().includes(query) ||
      (move.aliases || []).some((alias) => alias.toLowerCase().includes(query));
    const matchesStatus =
      statusFilter === 'All' ||
      move.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.appName}>Allegra</div>
        <div className={styles.subtitle}>Move Tracker</div>
      </div>

      <div className={styles.searchWrapper}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search moves..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className={styles.clearSearch} onClick={() => setSearch('')}>
            ×
          </button>
        )}
      </div>

      <div className={styles.filterRow}>
        {STATUS_FILTERS.map((s) => (
          <Pill
            key={s}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </Pill>
        ))}
      </div>

      <div className={styles.moveCount}>
        {filtered.length} move{filtered.length !== 1 ? 's' : ''}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>No moves found</div>
      ) : (
        filtered.map((move) => (
          <div
            key={move.id}
            className={styles.moveCard}
            onClick={() => navigate(`/move/${move.id}`)}
          >
            <div className={styles.moveName}>{move.name}</div>
            {move.aliases && move.aliases.length > 0 && (
              <div className={styles.moveAliases}>
                {move.aliases.join(', ')}
              </div>
            )}
            <StatusPill status={move.status} />
          </div>
        ))
      )}
    </div>
  );
}
