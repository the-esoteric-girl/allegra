import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';

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
  const { moves, sessions, deleteSession } = useApp();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState('newest');
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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
    setConfirmDeleteId(null);
  }

  async function handleDeleteSession(id) {
    await deleteSession(id);
    setExpandedSessionId(null);
    setConfirmDeleteId(null);
  }

  return (
    <div style={{ padding: '0 16px 80px' }}>
      <h1 style={{ textAlign: 'left' }}>You</h1>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
        {[
          { label: 'Achieved', count: achievedCount },
          { label: 'Working on', count: workingOnCount },
          { label: 'Want to try', count: wantToTryCount },
        ].map(({ label, count }) => (
          <div
            key={label}
            style={{
              flex: 1,
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '14px 10px',
              textAlign: 'center',
              background: 'var(--bg)',
            }}
          >
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', lineHeight: 1.1 }}>
              {count}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text)', marginTop: '4px' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Sessions */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0 }}>Sessions</h2>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            style={{
              fontSize: '13px',
              fontFamily: 'var(--sans)',
              color: 'var(--text)',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {sortedSessions.length === 0 ? (
          <p style={{ color: 'var(--text)', fontSize: '14px' }}>No sessions logged yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortedSessions.map(session => {
              const isExpanded = expandedSessionId === session.id;
              const moveCount = session.entries?.length ?? 0;

              return (
                <div
                  key={session.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '14px',
                    background: 'var(--bg)',
                    textAlign: 'left',
                  }}
                >
                  {/* Header row — always shown */}
                  <div
                    onClick={() => toggleSession(session.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-h)', fontSize: '15px' }}>
                        {formatDate(session.date)}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text)' }}>
                        {moveCount} {moveCount === 1 ? 'move' : 'moves'}
                      </span>
                    </div>

                    {!isExpanded && session.notes && (
                      <p style={{
                        fontSize: '13px',
                        color: 'var(--text)',
                        margin: 0,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}>
                        {session.notes}
                      </p>
                    )}
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{ marginTop: '8px' }}>
                      {session.notes && (
                        <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '12px', marginTop: 0 }}>
                          {session.notes}
                        </p>
                      )}

                      {(session.entries || []).length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--text)' }}>No moves logged.</p>
                      ) : (
                        <ul style={{ listStyle: 'none', margin: '0 0 12px', padding: 0 }}>
                          {(session.entries || []).map(entry => {
                            const move = getMoveById(entry.move_id);
                            const statusChanged =
                              entry.previous_status &&
                              entry.new_status &&
                              entry.previous_status !== entry.new_status;
                            return (
                              <li
                                key={entry.move_id}
                                style={{
                                  padding: '8px 0',
                                  borderTop: '1px solid var(--border)',
                                  fontSize: '14px',
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <span
                                  style={{ color: 'var(--accent)', fontWeight: 500, cursor: 'pointer' }}
                                  onClick={() => navigate(`/move/${entry.move_id}`)}
                                >
                                  {move?.name ?? 'Unknown move'}
                                </span>

                                {statusChanged && (
                                  <span style={{ color: 'var(--text)', fontSize: '13px' }}>
                                    {capitalize(entry.previous_status)} → {capitalize(entry.new_status)}
                                  </span>
                                )}

                                {entry.notes_added && (
                                  <span style={{
                                    fontSize: '12px',
                                    color: 'var(--accent)',
                                    background: 'var(--accent-bg)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                  }}>
                                    note added
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {/* Delete controls */}
                      {confirmDeleteId === session.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text)', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                          <span>Delete this session?</span>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            style={{
                              fontSize: '13px',
                              fontFamily: 'var(--sans)',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#c0392b',
                              color: '#fff',
                              cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            style={{
                              fontSize: '13px',
                              fontFamily: 'var(--sans)',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              background: 'transparent',
                              color: 'var(--text)',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                          <button
                            onClick={() => setConfirmDeleteId(session.id)}
                            style={{
                              fontSize: '13px',
                              fontFamily: 'var(--sans)',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              background: 'transparent',
                              color: 'var(--text)',
                              cursor: 'pointer',
                            }}
                          >
                            Delete session
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
