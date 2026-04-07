import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { Button, Select } from '../components/ui';
import styles from './You.module.css';

function formatDate(isoString) {
  const [year, month, day] = isoString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function You() {
  const { user, moves, sessions, signOut } = useApp();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState('newest');

  const achievedCount = moves.filter(m => m.status === 'achieved').length;
  const workingOnCount = moves.filter(m => m.status === 'working on').length;
  const wantToTryCount = moves.filter(m => m.status === 'want to try').length;

  const sortedSessions = [...sessions].sort((a, b) => {
    if (sortOrder === 'newest') return a.date < b.date ? 1 : -1;
    return a.date > b.date ? 1 : -1;
  });

  function getMoveById(id) {
    return moves.find(m => m.id === id);
  }

  async function handleSignOut() {
    const { error } = await signOut();
    if (!error) navigate('/auth');
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headingRow}>
          <div className={styles.pageTitle}>You</div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>

        {user?.email && (
          <p className={styles.userMeta}>{user.email}</p>
        )}
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        {[
          { label: 'Achieved', count: achievedCount },
          { label: 'Working on', count: workingOnCount },
          { label: 'Want to try', count: wantToTryCount },
        ].map(({ label, count }) => (
          <div key={label} className={styles.statCard}>
            <div className={styles.statCount}>{count}</div>
            <div className={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* Sessions */}
      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Sessions</h2>
          <Select
            id="sessions-sort"
            name="sessions-sort"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </Select>
        </div>

        {sortedSessions.length === 0 ? (
          <p className={styles.emptyText}>No sessions logged yet.</p>
        ) : (
          <div className={styles.sessionList}>
            {sortedSessions.map(session => {
              const entries = session.entries || [];
              const moveCount = entries.length;
              const visibleEntries = entries.slice(0, 3);
              const extraCount = moveCount - 3;
              const moveNamesPreview = visibleEntries
                .map(e => getMoveById(e.move_id)?.name ?? 'Unknown move')
                .join(' · ') + (extraCount > 0 ? ` +${extraCount} more` : '');

              return (
                <button
                  key={session.id}
                  className={styles.sessionCard}
                  onClick={() => navigate(`/sessions/${session.id}`)}
                  data-testid={`session-card-${session.id}`}
                >
                  <div className={styles.sessionDateRow}>
                    <span className={styles.sessionDate}>{formatDate(session.date)}</span>
                    <span className={styles.sessionMoveCount}>
                      {moveCount} {moveCount === 1 ? 'move' : 'moves'}
                    </span>
                  </div>

                  {moveCount > 0 && (
                    <p className={styles.sessionPreviewMoves}>{moveNamesPreview}</p>
                  )}

                  {session.notes && (
                    <p className={styles.sessionPreviewNotes}>{session.notes}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
