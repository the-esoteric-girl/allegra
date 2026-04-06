import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { Pill, StatusPill, Input, Card, Button } from '../components/ui';
import styles from './Library.module.css';

const STATUS_FILTERS = ['All', 'Achieved', 'Working On', 'Want To Try'];

export default function Library() {
  const { moves, librarySearch: search, setLibrarySearch: setSearch, libraryFilter: statusFilter, setLibraryFilter: setStatusFilter } = useApp();
  const navigate = useNavigate();
  const [sortDir, setSortDir] = useState('asc');

  const filtered = moves
    .filter((move) => {
      const query = search.toLowerCase();
      const matchesSearch =
        move.name.toLowerCase().includes(query) ||
        (move.aliases || []).some((alias) => alias.toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === 'All' ||
        (move.status || '').toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) =>
      sortDir === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.appName}>Allegra</div>
        <div className={styles.subtitle}>Move Tracker</div>
      </div>

      <Input
        id="library-search"
        name="library-search"
        className={styles.searchWrapper}
        inputClassName={styles.searchInput}
        type="text"
        placeholder="Search moves..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        rightIcon={
          search ? (
            <button
              type="button"
              className={styles.clearSearch}
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : null
        }
      />

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

      <div className={styles.moveCountRow}>
        <div className={styles.moveCount}>
          {filtered.length} move{filtered.length !== 1 ? 's' : ''}
        </div>
        <Button
          variant="subtle"
          size="sm"
          className={styles.sortToggle}
          onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
        >
          {sortDir === 'asc' ? 'A→Z' : 'Z→A'}
        </Button>
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
