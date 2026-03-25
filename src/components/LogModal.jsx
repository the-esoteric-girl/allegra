import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';

const STATUS_OPTIONS = ['want to try', 'working on', 'achieved'];
const STATUS_LABELS = {
  'want to try': 'Want to try',
  'working on': 'Working on',
  'achieved': 'Achieved',
};

function formatDatestamp(date) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = months[date.getMonth()];
  const d = date.getDate();
  const y = date.getFullYear();
  return y === new Date().getFullYear() ? `${m} ${d}` : `${m} ${d}, ${y}`;
}

function EmptyCircle() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="9" cy="9" r="7.5" stroke="#d1d5db" strokeWidth="1.5" />
    </svg>
  );
}

function FilledCheckmark() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="9" cy="9" r="9" fill="#22c55e" />
      <path d="M4.5 9l3 3 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SmallCheckmark() {
  return (
    <svg width={13} height={11} viewBox="0 0 13 11" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 5.5l4 4L12 1" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LogModal({ isOpen, onClose }) {
  const { moves, updateMove } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery]               = useState('');
  const [sessionLog, setSessionLog]                 = useState([]);
  // sessionLog entries: { moveId, status, notes, isPending, hasNote }
  const [expandedNoteEntryId, setExpandedNoteEntryId]         = useState(null);
  const [expandedPreviousNotesId, setExpandedPreviousNotesId] = useState(null);
  const [noteText, setNoteText]                     = useState('');
  const [saveSuccess, setSaveSuccess]               = useState(false);
  const [saveError, setSaveError]                   = useState(null);

  const entryRefs = useRef({});

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSessionLog([]);
      setExpandedNoteEntryId(null);
      setExpandedPreviousNotesId(null);
      setNoteText('');
      setSaveSuccess(false);
      setSaveError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = searchQuery.trim().toLowerCase();
  const filteredMoves = q
    ? moves.filter(m => {
        if (m.name.toLowerCase().includes(q)) return true;
        if (Array.isArray(m.aliases) && m.aliases.some(a => a.toLowerCase().includes(q))) return true;
        return false;
      })
    : [];

  function flash() {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }

  function handleSearchResultClick(move) {
    const existing = sessionLog.find(e => e.moveId === move.id);
    if (existing) {
      const el = entryRefs.current[move.id];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    setSessionLog(prev => [...prev, {
      moveId: move.id,
      status: move.status,
      notes: '',
      isPending: true,
      hasNote: false,
    }]);
  }

  function handleStatusChange(moveId, newStatus) {
    setSessionLog(prev => prev.map(e =>
      e.moveId === moveId ? { ...e, status: newStatus } : e
    ));
  }

  function handleRemoveEntry(moveId) {
    setSessionLog(prev => prev.filter(e => e.moveId !== moveId));
    if (expandedNoteEntryId === moveId) {
      setExpandedNoteEntryId(null);
      setNoteText('');
    }
    if (expandedPreviousNotesId === moveId) {
      setExpandedPreviousNotesId(null);
    }
  }

  function handleAddNote(moveId) {
    if (expandedNoteEntryId === moveId) {
      setExpandedNoteEntryId(null);
      setNoteText('');
      setExpandedPreviousNotesId(null);
    } else {
      setExpandedNoteEntryId(moveId);
      setNoteText('');
      setExpandedPreviousNotesId(null);
    }
  }

  async function handleSaveNote(entry) {
    setSaveError(null);
    if (!noteText.trim()) {
      setExpandedNoteEntryId(null);
      setExpandedPreviousNotesId(null);
      return;
    }
    const move = moves.find(m => m.id === entry.moveId);
    const existingNotes = move?.notes || '';
    const stamp = formatDatestamp(new Date());
    const notesToSave = `[${stamp}] ${noteText.trim()}${existingNotes ? '\n' + existingNotes : ''}`;
    try {
      await updateMove(entry.moveId, { notes: notesToSave });
      setSessionLog(prev => prev.map(e =>
        e.moveId === entry.moveId ? { ...e, hasNote: true } : e
      ));
      setExpandedNoteEntryId(null);
      setNoteText('');
      setExpandedPreviousNotesId(null);
      flash();
    } catch {
      setSaveError('Failed to save. Please try again.');
    }
  }

  async function handleDone() {
    setSaveError(null);
    const pending = sessionLog.filter(e => e.isPending);
    if (pending.length === 0) {
      onClose();
      return;
    }
    try {
      await Promise.all(pending.map(e => updateMove(e.moveId, { status: e.status })));
      setSessionLog(prev => prev.map(e => e.isPending ? { ...e, isPending: false } : e));
      setSearchQuery('');
      flash();
    } catch {
      setSaveError('Failed to save. Please try again.');
    }
  }

  // ── Styles ────────────────────────────────────────────────────────────────────

  const s = {
    overlay: {
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex', alignItems: 'flex-end',
    },
    sheet: {
      width: '100%', height: '85vh',
      backgroundColor: '#fff',
      borderRadius: '20px 20px 0 0',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    },
    dragHandle: {
      display: 'flex', justifyContent: 'center',
      padding: '10px 0 4px', flexShrink: 0,
    },
    dragBar: {
      width: '40px', height: '4px',
      backgroundColor: '#d1d5db', borderRadius: '99px',
    },
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '4px 16px 12px', flexShrink: 0,
    },
    title: { margin: 0, fontSize: '20px', fontWeight: 700, color: '#111' },
    closeBtn: {
      background: 'none', border: 'none',
      fontSize: '24px', lineHeight: 1,
      cursor: 'pointer', color: '#6b7280',
      padding: '2px 4px',
    },

    contentArea: {
      flex: 1, minHeight: 0,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    },

    searchWrap: {
      padding: '0 16px 10px', flexShrink: 0,
      position: 'relative',
    },
    searchInput: {
      width: '100%', boxSizing: 'border-box',
      padding: '10px 36px 10px 14px', fontSize: '15px',
      border: '1px solid #e5e7eb', borderRadius: '10px',
      outline: 'none', backgroundColor: '#f9fafb',
    },
    searchClear: {
      position: 'absolute', right: '26px',
      top: '50%', transform: 'translateY(-60%)',
      background: 'none', border: 'none',
      cursor: 'pointer', color: '#9ca3af',
      fontSize: '20px', lineHeight: 1,
      padding: '0',
    },

    moveList: { flex: 1, minHeight: 0, overflowY: 'auto' },
    emptyState: {
      padding: '32px 16px', textAlign: 'center',
      color: '#9ca3af', fontSize: '14px',
    },
    moveItem: (inSession) => ({
      display: 'flex', alignItems: 'center',
      padding: '11px 16px', gap: '10px',
      cursor: 'pointer',
      backgroundColor: inSession ? '#f3f4f6' : 'transparent',
      borderBottom: '1px solid #f5f5f5',
    }),
    moveInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
    moveName: (inSession) => ({
      fontSize: '15px',
      color: inSession ? '#9ca3af' : '#111',
    }),
    moveStatusText: { fontSize: '12px', color: '#9ca3af' },

    sessionSection: {
      flexShrink: 0,
      borderTop: '2px solid #f0f0f0',
      display: 'flex', flexDirection: 'column',
      maxHeight: '45%',
    },
    sessionHeader: {
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '10px 16px',
      backgroundColor: '#f9fafb', flexShrink: 0,
    },
    sessionTitle: { fontSize: '14px', fontWeight: 600, color: '#374151' },
    sessionCount: {
      fontSize: '12px', color: '#9ca3af',
      backgroundColor: '#e5e7eb',
      padding: '1px 7px', borderRadius: '99px',
    },
    sessionList: { overflowY: 'auto', flex: 1 },

    sessionEntry: {
      display: 'flex', alignItems: 'center',
      padding: '9px 12px 9px 16px', gap: '8px',
      borderBottom: '1px solid #f5f5f5',
    },
    entryMain: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
    entryMoveName: {
      fontSize: '14px', color: '#374151', fontWeight: 500,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    pendingText: { fontSize: '11px', color: '#9ca3af' },
    confirmedRow: { display: 'flex', alignItems: 'center', gap: '3px' },
    confirmedText: { fontSize: '11px', color: '#22c55e' },

    statusSelect: {
      fontSize: '12px', padding: '4px 6px',
      border: '1px solid #e5e7eb', borderRadius: '6px',
      backgroundColor: '#fff', color: '#374151',
      cursor: 'pointer', flexShrink: 0,
      outline: 'none',
    },
    addNoteBtn: {
      fontSize: '12px', padding: '4px 8px',
      border: '1px solid #e5e7eb', borderRadius: '6px',
      backgroundColor: '#fff', color: '#6b7280',
      cursor: 'pointer', flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    removeBtn: {
      background: 'none', border: 'none',
      fontSize: '20px', lineHeight: 1,
      cursor: 'pointer', color: '#d1d5db',
      padding: '0 2px', flexShrink: 0,
    },

    expandedForm: {
      padding: '10px 16px 12px',
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex', flexDirection: 'column', gap: '8px',
    },
    textarea: {
      width: '100%', boxSizing: 'border-box',
      padding: '9px 12px', fontSize: '14px',
      border: '1px solid #e5e7eb', borderRadius: '8px',
      resize: 'vertical', outline: 'none',
      fontFamily: 'inherit', color: '#111',
      backgroundColor: '#fff',
    },
    prevNotesToggle: {
      background: 'none', border: 'none',
      padding: '2px 0', fontSize: '13px',
      color: '#6b7280', cursor: 'pointer',
      textAlign: 'left',
    },
    prevNotesContent: {
      marginTop: '6px', padding: '8px 10px',
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb', borderRadius: '6px',
      fontSize: '13px', color: '#6b7280',
      whiteSpace: 'pre-wrap', lineHeight: 1.5,
    },
    noteActions: { display: 'flex', gap: '8px' },
    saveNoteBtn: {
      flex: 1, padding: '8px', fontSize: '13px',
      border: 'none', borderRadius: '8px', cursor: 'pointer',
      backgroundColor: '#3b82f6', color: '#fff', fontWeight: 600,
    },
    cancelNoteBtn: {
      flex: 1, padding: '8px', fontSize: '13px',
      border: '1px solid #e5e7eb', borderRadius: '8px',
      cursor: 'pointer', backgroundColor: '#fff', color: '#374151',
    },

    banner: (type) => ({
      margin: '0 16px 4px',
      padding: '7px 12px',
      borderRadius: '8px',
      fontSize: '13px', fontWeight: 500,
      textAlign: 'center', flexShrink: 0,
      backgroundColor: type === 'success' ? '#dcfce7' : '#fee2e2',
      color: type === 'success' ? '#16a34a' : '#dc2626',
    }),

    bottomBar: {
      borderTop: '1px solid #f0f0f0',
      padding: '10px 16px',
      flexShrink: 0,
      backgroundColor: '#fafafa',
      display: 'flex', gap: '8px',
    },
    doneBtn: {
      flex: 1, padding: '11px', fontSize: '14px',
      border: 'none', borderRadius: '10px', cursor: 'pointer',
      backgroundColor: '#3b82f6', color: '#fff', fontWeight: 600,
    },
    newComboBtn: {
      flex: 1, padding: '11px',
      border: '1px solid #e5e7eb', borderRadius: '10px',
      cursor: 'pointer', backgroundColor: '#fff',
      fontSize: '14px', color: '#374151', fontWeight: 500,
    },
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.sheet} onClick={e => e.stopPropagation()}>

        {/* Drag handle */}
        <div style={s.dragHandle}>
          <div style={s.dragBar} />
        </div>

        {/* Header */}
        <div style={s.header}>
          <h2 style={s.title}>Log</h2>
          <button style={s.closeBtn} onClick={onClose}>&times;</button>
        </div>

        {/* Content area */}
        <div style={s.contentArea}>

          {/* Search */}
          <div style={s.searchWrap}>
            <input
              type="text"
              placeholder="Search for a move..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={s.searchInput}
            />
            {searchQuery && (
              <button style={s.searchClear} onClick={() => setSearchQuery('')}>
                &times;
              </button>
            )}
          </div>

          {/* Move list */}
          <div style={s.moveList}>
            {q === '' ? (
              <div style={s.emptyState}>Search for a move to log</div>
            ) : filteredMoves.length === 0 ? (
              <div style={s.emptyState}>No moves found</div>
            ) : (
              filteredMoves.map(move => {
                const inSession = !!sessionLog.find(e => e.moveId === move.id);
                return (
                  <div
                    key={move.id}
                    style={s.moveItem(inSession)}
                    onClick={() => handleSearchResultClick(move)}
                  >
                    {inSession ? <FilledCheckmark /> : <EmptyCircle />}
                    <div style={s.moveInfo}>
                      <span style={s.moveName(inSession)}>{move.name}</span>
                      <span style={s.moveStatusText}>
                        {STATUS_LABELS[move.status] ?? move.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* This session */}
          {sessionLog.length > 0 && (
            <div style={s.sessionSection}>
              <div style={s.sessionHeader}>
                <span style={s.sessionTitle}>This session</span>
                <span style={s.sessionCount}>{sessionLog.length}</span>
              </div>
              <div style={s.sessionList}>
                {sessionLog.map(entry => {
                  const move = moves.find(m => m.id === entry.moveId);
                  const isNoteExpanded = expandedNoteEntryId === entry.moveId;
                  const isPrevExpanded = expandedPreviousNotesId === entry.moveId;
                  return (
                    <div
                      key={entry.moveId}
                      ref={el => { entryRefs.current[entry.moveId] = el; }}
                    >
                      <div style={s.sessionEntry}>
                        <div style={s.entryMain}>
                          <span style={s.entryMoveName}>{move?.name ?? 'Unknown'}</span>
                          {entry.isPending ? (
                            <span style={s.pendingText}>pending</span>
                          ) : (
                            <div style={s.confirmedRow}>
                              <SmallCheckmark />
                            </div>
                          )}
                        </div>

                        <select
                          style={s.statusSelect}
                          value={entry.status}
                          onChange={e => handleStatusChange(entry.moveId, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(st => (
                            <option key={st} value={st}>{STATUS_LABELS[st]}</option>
                          ))}
                        </select>

                        <button
                          style={s.addNoteBtn}
                          onClick={() => handleAddNote(entry.moveId)}
                        >
                          Add note
                        </button>

                        {entry.isPending && (
                          <button
                            style={s.removeBtn}
                            onClick={() => handleRemoveEntry(entry.moveId)}
                          >
                            &times;
                          </button>
                        )}
                      </div>

                      {isNoteExpanded && (
                        <div style={s.expandedForm}>
                          <textarea
                            rows={3}
                            style={s.textarea}
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            placeholder="Add a note..."
                            autoFocus
                          />

                          <div>
                            <button
                              style={s.prevNotesToggle}
                              onClick={() => setExpandedPreviousNotesId(
                                isPrevExpanded ? null : entry.moveId
                              )}
                            >
                              Previous notes {isPrevExpanded ? '▴' : '▾'}
                            </button>
                            {isPrevExpanded && (
                              <div style={s.prevNotesContent}>
                                {move?.notes
                                  ? move.notes
                                  : <span style={{ color: '#c4c4c4' }}>No previous notes</span>
                                }
                              </div>
                            )}
                          </div>

                          <div style={s.noteActions}>
                            <button style={s.saveNoteBtn} onClick={() => handleSaveNote(entry)}>
                              Save note
                            </button>
                            <button
                              style={s.cancelNoteBtn}
                              onClick={() => {
                                setExpandedNoteEntryId(null);
                                setNoteText('');
                                setExpandedPreviousNotesId(null);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Banners */}
        {saveSuccess && <div style={s.banner('success')}>Saved ✓</div>}
        {saveError   && <div style={s.banner('error')}>{saveError}</div>}

        {/* Bottom bar */}
        <div style={s.bottomBar}>
          <button style={s.doneBtn} onClick={handleDone}>Done</button>
          <button
            style={s.newComboBtn}
            onClick={() => { onClose(); navigate('/combos'); }}
          >
            + New combo
          </button>
        </div>

      </div>
    </div>
  );
}
