import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';

const STATUS_OPTIONS = ['achieved', 'working on', 'want to try'];

const STATUS_LABELS = {
  'achieved': 'Achieved',
  'working on': 'Working on',
  'want to try': 'Want to try',
};

function formatDate(isoString) {
  const [year, month, day] = isoString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function You() {
  const { moves, sessions } = useApp();
  const navigate = useNavigate();
  const [activeStatusFilter, setActiveStatusFilter] = useState('achieved');
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  const filteredMoves = moves.filter(m => m.status === activeStatusFilter);

  function getMoveById(id) {
    return moves.find(m => m.id === id);
  }

  function toggleSession(id) {
    setExpandedSessionId(prev => (prev === id ? null : id));
  }

  return (
    <div style={{ padding: '0 16px 80px' }}>
      <h1 style={{ textAlign: 'left' }}>You</h1>

      {/* Your Moves */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Your moves</h2>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map(status => {
            const count = moves.filter(m => m.status === status).length;
            const isActive = activeStatusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setActiveStatusFilter(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                  background: isActive ? 'var(--accent-bg)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'var(--sans)',
                  whiteSpace: 'nowrap',
                }}
              >
                {STATUS_LABELS[status]} ({count})
              </button>
            );
          })}
        </div>

        {filteredMoves.length === 0 ? (
          <p style={{ color: 'var(--text)', fontSize: '14px' }}>No moves yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {filteredMoves.map(move => (
              <li
                key={move.id}
                onClick={() => navigate(`/move/${move.id}`)}
                style={{
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  color: 'var(--text-h)',
                  fontSize: '15px',
                  textAlign: 'left',
                }}
              >
                {move.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Your Sessions */}
      <section>
        <h2>Your sessions</h2>

        {sessions.length === 0 ? (
          <p style={{ color: 'var(--text)', fontSize: '14px' }}>No sessions logged yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.map(session => {
              const isExpanded = expandedSessionId === session.id;
              const moveCount = session.entries?.length ?? 0;
              const moveNames = (session.entries || [])
                .map(e => getMoveById(e.move_id)?.name)
                .filter(Boolean)
                .join(', ');

              return (
                <div
                  key={session.id}
                  onClick={() => toggleSession(session.id)}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '14px',
                    cursor: 'pointer',
                    background: 'var(--bg)',
                    textAlign: 'left',
                  }}
                >
                  {/* Collapsed header — always shown */}
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
                      margin: '0 0 4px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}>
                      {session.notes}
                    </p>
                  )}

                  {!isExpanded && moveNames && (
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text)',
                      margin: 0,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}>
                      {moveNames}
                    </p>
                  )}

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{ marginTop: '8px' }}>
                      {session.notes && (
                        <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '12px' }}>
                          {session.notes}
                        </p>
                      )}
                      {(session.entries || []).length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--text)' }}>No moves logged.</p>
                      ) : (
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                          {console.log('[You] session entries:', JSON.stringify(session.entries, null, 2))}
                          {(session.entries || []).map(entry => {
                            const move = getMoveById(entry.move_id);
                            const statusChanged = entry.previous_status && entry.new_status && entry.previous_status !== entry.new_status;
                            return (
                              <li
                                key={entry.move_id}
                                style={{
                                  padding: '8px 0',
                                  borderTop: '1px solid var(--border)',
                                  fontSize: '14px',
                                }}
                              >
                                <span
                                  style={{ color: 'var(--text-h)', fontWeight: 500, cursor: 'pointer' }}
                                  onClick={e => { e.stopPropagation(); navigate(`/move/${entry.move_id}`); }}
                                >
                                  {move?.name ?? 'Unknown move'}
                                </span>

                                {statusChanged && (
                                  <span style={{ color: 'var(--text)', fontSize: '13px', marginLeft: '8px' }}>
                                    {entry.previous_status} → {entry.new_status}
                                  </span>
                                )}

                                {entry.notes_added && (
                                  <span style={{
                                    marginLeft: '8px',
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
