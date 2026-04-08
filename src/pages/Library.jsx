import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { StatusPill, Card, Select, MoveListControls, EmptyState } from '../components/ui';
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
        searchPlaceholder="Search moves..."
        className={styles.controls}
        searchClassName={styles.searchWrapper}
        searchInputClassName={styles.searchInput}
      />

      <div className={styles.moveCountRow}>
        <div className={styles.moveCount}>
          {filtered.length} move{filtered.length !== 1 ? 's' : ''}
        </div>
        <Select
          id="library-sort"
          name="library-sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          options={[
            { value: 'alpha-asc', label: 'A→Z' },
            { value: 'alpha-desc', label: 'Z→A' },
            { value: 'status', label: 'Status' },
            { value: 'created-desc', label: 'Newest created' },
            { value: 'created-asc', label: 'Oldest created' },
          ]}
          className={styles.sortSelect}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState body="No moves found" className={styles.emptyState} />
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
