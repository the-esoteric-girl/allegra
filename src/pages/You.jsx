import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { Button, ConfirmDialog, Select } from '../components/ui';
import styles from './You.module.css';

function formatDate(isoString) {
  const [year, month, day] = isoString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function You() {
  const { user, moves, sessions, deleteSession, signOut } = useApp();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState('newest');
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [sessionPendingDelete, setSessionPendingDelete] = useState(null);
  const [deletingSession, setDeletingSession] = useState(false);

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

  function toggleSession(id) {
    setExpandedSessionId(prev => (prev === id ? null : id));
  }

  async function handleDeleteSession(id) {
    setDeletingSession(true);
    await deleteSession(id);
    setDeletingSession(false);
    setExpandedSessionId(null);
    setSessionPendingDelete(null);
  }

  async function handleSignOut() {
    const { error } = await signOut();
    if (!error) navigate('/auth');
  }

  return (
    <div className={styles.page}>
      <div className={styles.headingRow}>
        <h1 className={styles.heading}>You</h1>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>

      {user?.email && (
        <p className={styles.userMeta}>{user.email}</p>
      )}

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
              const isExpanded = expandedSessionId === session.id;
              const entries = session.entries || [];
              const moveCount = entries.length;

              const visibleEntries = entries.slice(0, 3);
              const extraCount = moveCount - 3;
              const moveNamesPreview = visibleEntries
                .map(e => getMoveById(e.move_id)?.name ?? 'Unknown move')
                .join(' · ') + (extraCount > 0 ? ` +${extraCount} more` : '');

              return (
                <div key={session.id} className={styles.sessionCard}>
                  <div
                    className={styles.sessionCardHeader}
                    onClick={() => toggleSession(session.id)}
                    data-testid={`session-toggle-${session.id}`}
                  >
                    <div className={styles.sessionCardLeft}>
                      <div className={styles.sessionDateRow}>
                        <span className={styles.sessionDate}>{formatDate(session.date)}</span>
                        <span className={styles.sessionMoveCount}>
                          {moveCount} {moveCount === 1 ? 'move' : 'moves'}
                        </span>
                      </div>

                      {!isExpanded && moveCount > 0 && (
                        <p className={styles.sessionPreviewMoves}>{moveNamesPreview}</p>
                      )}

                      {!isExpanded && (
                        session.notes ? (
                          <p className={styles.sessionPreviewNotes}>{session.notes}</p>
                        ) : (
                          <FileText size={14} color="var(--color-text-muted)" style={{ opacity: 0.4, marginTop: '2px' }} />
                        )
                      )}
                    </div>

                    <div className={styles.sessionChevron}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className={styles.sessionExpanded}>
                      {session.notes && (
                        <p className={styles.sessionNotes}>{session.notes}</p>
                      )}

                      {entries.length === 0 ? (
                        <p className={styles.noMoves}>No moves logged.</p>
                      ) : (
                        <ul className={styles.entryList}>
                          {entries.map(entry => {
                            const move = getMoveById(entry.move_id);
                            const statusChanged =
                              entry.previous_status &&
                              entry.new_status &&
                              entry.previous_status !== entry.new_status;
                            return (
                              <li key={entry.move_id} className={styles.entryItem}>
                                <div className={styles.entryRow}>
                                  <span
                                    className={styles.entryMoveName}
                                    onClick={() => navigate(`/move/${entry.move_id}`)}
                                  >
                                    {move?.name ?? 'Unknown move'}
                                  </span>

                                  {statusChanged && (
                                    <span className={styles.entryStatusChange}>
                                      {capitalize(entry.previous_status)} → {capitalize(entry.new_status)}
                                    </span>
                                  )}

                                  {entry.notes_added && (
                                    <span className={styles.entryNoteAdded}>note added</span>
                                  )}
                                </div>

                              </li>
                            );
                          })}
                        </ul>
                      )}

                      <div className={styles.deleteZone}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 size={14} />}
                          onClick={() => setSessionPendingDelete(session)}
                          className={styles.deleteButton}
                          data-testid={`delete-session-${session.id}`}
                        >
                          Delete session
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={Boolean(sessionPendingDelete)}
        title="Delete session?"
        message={sessionPendingDelete ? `This will permanently remove your session from ${formatDate(sessionPendingDelete.date)}.` : ''}
        confirmLabel="Delete session"
        cancelLabel="Keep session"
        onCancel={() => setSessionPendingDelete(null)}
        onConfirm={() => sessionPendingDelete && handleDeleteSession(sessionPendingDelete.id)}
        loading={deletingSession}
        testIdPrefix="delete-session-dialog"
      />
    </div>
  );
}
