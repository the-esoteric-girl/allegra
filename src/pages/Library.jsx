import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { StatusPill, Card, MoveListControls } from '../components/ui';
import { filterMovesBySearchAndStatus, sortMoves } from '../lib/moveListControls';
import styles from './Library.module.css';

export default function Library() {
  const { moves, librarySearch: search, setLibrarySearch: setSearch } = useApp();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('any');
  const [sortBy, setSortBy] = useState('alpha-asc');

  const filtered = sortMoves(
    filterMovesBySearchAndStatus(moves, { searchQuery: search, statusFilter }),
    sortBy
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.appName}>Allegra</div>
        <div className={styles.subtitle}>Move Tracker</div>
      </div>

      <MoveListControls
        idPrefix="library"
        searchValue={search}
        onSearchChange={setSearch}
        onSearchClear={() => setSearch('')}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        includeCreatedSort
        searchPlaceholder="Search moves..."
        className={styles.controls}
        searchClassName={styles.searchWrapper}
        searchInputClassName={styles.searchInput}
      />

      <div className={styles.moveCountRow}>
        <div className={styles.moveCount}>
          {filtered.length} move{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>No moves found</div>
      ) : (
        filtered.map((move) => (
          <Card
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
            {move.status && <StatusPill status={move.status} />}
          </Card>
        ))
      )}
    </div>
  );
}
