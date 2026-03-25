import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { Trash2, X, ChevronDown, ChevronUp, Check, Circle } from 'lucide-react';

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

function formatReviewDate(date) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function LogModal({ isOpen, onClose }) {
  const { moves, updateMove, createSession, addSessionEntry } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState('logging');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionEntries, setSessionEntries] = useState([]);
  // sessionEntries: { moveId, previousStatus, currentStatus, notes, hasNote, expandedNote, expandedPreviousNotes }
  const [sessionNotes, setSessionNotes] = useState('');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [expandedReviewNote, setExpandedReviewNote] = useState([]);

  const entryRefs = useRef({});

  useEffect(() => {
    if (isOpen) {
      setMode('logging');
      setSearchQuery('');
      setSessionEntries([]);
      setSessionNotes('');
      setShowCloseConfirm(false);
      setExpandedReviewNote([]);
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

  const anyNoteExpanded = sessionEntries.some(e => e.expandedNote);
  const reviewButtonVisible = sessionEntries.length > 0 && !anyNoteExpanded;

  function handleCloseAttempt() {
    if (sessionEntries.length > 0) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  }

  function handleSearchResultClick(move) {
    const existing = sessionEntries.find(e => e.moveId === move.id);
    if (existing) {
      const el = entryRefs.current[move.id];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    setSessionEntries(prev => [...prev, {
      moveId: move.id,
      previousStatus: move.status,
      currentStatus: move.status,
      notes: '',
      savedNoteText: '',
      hasNote: false,
      expandedNote: false,
      expandedPreviousNotes: false,
    }]);
  }

  async function handleStatusChange(moveId, newStatus) {
    setSessionEntries(prev => prev.map(e =>
      e.moveId === moveId ? { ...e, currentStatus: newStatus } : e
    ));
    await updateMove(moveId, { status: newStatus });
  }

  async function handleRemoveEntry(moveId) {
    const entry = sessionEntries.find(e => e.moveId === moveId);
    setSessionEntries(prev => prev.filter(e => e.moveId !== moveId));
    if (entry) {
      await updateMove(moveId, { status: entry.previousStatus });
    }
  }

  function handleToggleNote(moveId) {
    setSessionEntries(prev => prev.map(e =>
      e.moveId === moveId ? { ...e, expandedNote: !e.expandedNote } : e
    ));
  }

  function handleNoteChange(moveId, value) {
    setSessionEntries(prev => prev.map(e =>
      e.moveId === moveId ? { ...e, notes: value } : e
    ));
  }

  function handleTogglePreviousNotes(moveId) {
    setSessionEntries(prev => prev.map(e =>
      e.moveId === moveId ? { ...e, expandedPreviousNotes: !e.expandedPreviousNotes } : e
    ));
  }

  async function handleSaveNote(entry) {
    if (!entry.notes.trim()) {
      setSessionEntries(prev => prev.map(e =>
        e.moveId === entry.moveId
          ? { ...e, expandedNote: false, expandedPreviousNotes: false }
          : e
      ));
      return;
    }
    const move = moves.find(m => m.id === entry.moveId);
    const existingNotes = move?.notes || '';
    const stamp = formatDatestamp(new Date());
    const notesToSave = `[${stamp}] ${entry.notes.trim()}${existingNotes ? '\n' + existingNotes : ''}`;
    await updateMove(entry.moveId, { notes: notesToSave });
    setSessionEntries(prev => prev.map(e =>
      e.moveId === entry.moveId
        ? { ...e, hasNote: true, savedNoteText: entry.notes.trim(), expandedNote: false, notes: '', expandedPreviousNotes: false }
        : e
    ));
  }

  function handleCancelNote(moveId) {
    setSessionEntries(prev => prev.map(e =>
      e.moveId === moveId
        ? { ...e, expandedNote: false, notes: '', expandedPreviousNotes: false }
        : e
    ));
  }

  async function handleSaveSession() {
    const session = await createSession(sessionNotes);
    if (!session) return;
    await Promise.all(
      sessionEntries.map(e =>
        addSessionEntry(session.id, e.moveId, e.previousStatus, e.currentStatus, e.hasNote)
      )
    );
    onClose();
  }

  // ── Styles ──────────────────────────────────────────────────────────────────

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
      position: 'relative',
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
      cursor: 'pointer', color: '#6b7280',
      padding: '4px', display: 'flex', alignItems: 'center',
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
      display: 'flex', alignItems: 'center', padding: '0',
    },
    moveList: {
      flexShrink: 0,
      maxHeight: 'calc(85vh * 0.35)',
      overflowY: 'auto',
    },
    emptyState: {
      padding: '24px 16px', textAlign: 'center',
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
      flex: 1, minHeight: 0,
      borderTop: '2px solid #f0f0f0',
      display: 'flex', flexDirection: 'column',
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
    entryMain: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 },
    entryMoveName: {
      fontSize: '14px', color: '#374151', fontWeight: 600,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    entryControls: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
    statusSelect: {
      fontSize: '12px', padding: '4px 6px',
      border: '1px solid #e5e7eb', borderRadius: '6px',
      backgroundColor: '#fff', color: '#374151',
      cursor: 'pointer', flexShrink: 0, outline: 'none',
    },
    addNoteBtn: (hasNote) => ({
      fontSize: '12px', padding: '4px 8px',
      border: '1px solid #e5e7eb', borderRadius: '6px',
      backgroundColor: hasNote ? '#f0fdf4' : '#fff',
      color: hasNote ? '#16a34a' : '#6b7280',
      cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
    }),
    trashBtn: {
      background: 'none', border: 'none',
      cursor: 'pointer', color: '#d1d5db',
      padding: '2px', flexShrink: 0,
      display: 'flex', alignItems: 'center',
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
      textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px',
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
    bottomBar: {
      borderTop: '1px solid #f0f0f0',
      padding: '10px 16px',
      flexShrink: 0,
      backgroundColor: '#fafafa',
      display: 'flex', gap: '8px',
    },
    reviewBtn: {
      flex: 1, padding: '11px', fontSize: '14px',
      border: 'none', borderRadius: '10px', cursor: 'pointer',
      backgroundColor: '#3b82f6', color: '#fff', fontWeight: 600,
    },
    newComboBtn: {
      padding: '11px 16px',
      border: '1px solid #e5e7eb', borderRadius: '10px',
      cursor: 'pointer', backgroundColor: '#fff',
      fontSize: '14px', color: '#374151', fontWeight: 500,
      flexShrink: 0,
    },
    confirmOverlay: {
      position: 'absolute', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10,
    },
    confirmBox: {
      backgroundColor: '#fff', borderRadius: '12px',
      padding: '20px', margin: '0 24px',
      display: 'flex', flexDirection: 'column', gap: '12px',
    },
    confirmText: {
      fontSize: '15px', color: '#111',
      margin: 0, textAlign: 'center',
    },
    confirmActions: { display: 'flex', gap: '8px' },
    confirmCloseBtn: {
      flex: 1, padding: '10px', fontSize: '14px',
      border: 'none', borderRadius: '8px', cursor: 'pointer',
      backgroundColor: '#ef4444', color: '#fff', fontWeight: 600,
    },
    confirmCancelBtn: {
      flex: 1, padding: '10px', fontSize: '14px',
      border: '1px solid #e5e7eb', borderRadius: '8px',
      cursor: 'pointer', backgroundColor: '#fff', color: '#374151',
    },
    reviewContent: {
      flex: 1, minHeight: 0, overflowY: 'auto',
      padding: '0 16px 16px',
    },
    reviewDate: {
      fontSize: '14px', color: '#9ca3af',
      padding: '12px 0 8px',
    },
    reviewEntry: {
      padding: '10px 0',
      borderBottom: '1px solid #f5f5f5',
      display: 'flex', flexDirection: 'column', gap: '4px',
    },
    reviewMoveName: { fontSize: '15px', fontWeight: 600, color: '#111' },
    reviewStatusRow: {
      display: 'flex', alignItems: 'center', gap: '6px',
      fontSize: '13px', color: '#6b7280',
    },
    reviewNoteText: (expanded) => ({
      fontSize: '13px', color: '#6b7280',
      lineHeight: 1.5,
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: expanded ? 'unset' : 2,
      overflow: expanded ? 'visible' : 'hidden',
    }),
    reviewNoteToggle: {
      background: 'none', border: 'none',
      padding: '2px 0 0', fontSize: '13px',
      color: '#3b82f6', cursor: 'pointer',
      textAlign: 'left',
    },
    sessionNotesTextarea: {
      width: '100%', boxSizing: 'border-box',
      padding: '10px 12px', fontSize: '14px',
      border: '1px solid #e5e7eb', borderRadius: '8px',
      resize: 'vertical', outline: 'none',
      fontFamily: 'inherit', color: '#111',
      marginTop: '12px',
    },
    backBtn: {
      padding: '11px 16px', fontSize: '14px',
      border: '1px solid #e5e7eb', borderRadius: '10px',
      cursor: 'pointer', backgroundColor: '#fff',
      color: '#374151', fontWeight: 500, flexShrink: 0,
    },
    saveSessionBtn: {
      flex: 1, padding: '11px', fontSize: '14px',
      border: 'none', borderRadius: '10px', cursor: 'pointer',
      backgroundColor: '#3b82f6', color: '#fff', fontWeight: 600,
    },
  };

  // ── Review mode ──────────────────────────────────────────────────────────────

  if (mode === 'review') {
    return (
      <div style={s.overlay}>
        <div style={s.sheet}>
          <div style={s.dragHandle}><div style={s.dragBar} /></div>

          <div style={s.header}>
            <h2 style={s.title}>Session summary</h2>
          </div>

          <div style={s.reviewContent}>
            <div style={s.reviewDate}>{formatReviewDate(new Date())}</div>

            {sessionEntries.map(entry => {
              const move = moves.find(m => m.id === entry.moveId);
              const statusChanged = entry.previousStatus !== entry.currentStatus;
              const showNote = entry.hasNote && entry.savedNoteText;
              const isNoteExpanded = expandedReviewNote.includes(entry.moveId);
              const noteLong = showNote && (
                entry.savedNoteText.length > 100 || entry.savedNoteText.includes('\n')
              );
              return (
                <div key={entry.moveId} style={s.reviewEntry}>
                  <span style={s.reviewMoveName}>{move?.name ?? 'Unknown'}</span>
                  <div style={s.reviewStatusRow}>
                    {statusChanged ? (
                      <>
                        <span>{STATUS_LABELS[entry.previousStatus] ?? entry.previousStatus}</span>
                        <span>→</span>
                        <span style={{ color: '#374151', fontWeight: 500 }}>
                          {STATUS_LABELS[entry.currentStatus] ?? entry.currentStatus}
                        </span>
                      </>
                    ) : (
                      <span>{STATUS_LABELS[entry.currentStatus] ?? entry.currentStatus}</span>
                    )}
                  </div>
                  {showNote && (
                    <>
                      <p style={{ ...s.reviewNoteText(isNoteExpanded), margin: '2px 0 0' }}>
                        {entry.savedNoteText}
                      </p>
                      {noteLong && (
                        <button
                          style={s.reviewNoteToggle}
                          onClick={() => setExpandedReviewNote(prev =>
                            isNoteExpanded
                              ? prev.filter(id => id !== entry.moveId)
                              : [...prev, entry.moveId]
                          )}
                        >
                          {isNoteExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            <textarea
              rows={4}
              style={s.sessionNotesTextarea}
              value={sessionNotes}
              onChange={e => setSessionNotes(e.target.value)}
              placeholder="How did it go? Any overall notes..."
            />
          </div>

          <div style={s.bottomBar}>
            <button style={s.backBtn} onClick={() => setMode('logging')}>← Back</button>
            <button style={s.saveSessionBtn} onClick={handleSaveSession}>Save session</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Logging mode ─────────────────────────────────────────────────────────────

  return (
    <div style={s.overlay} onClick={handleCloseAttempt}>
      <div style={s.sheet} onClick={e => e.stopPropagation()}>

        {showCloseConfirm && (
          <div style={s.confirmOverlay}>
            <div style={s.confirmBox}>
              <p style={s.confirmText}>You have unsaved moves. Close anyway?</p>
              <div style={s.confirmActions}>
                <button style={s.confirmCloseBtn} onClick={onClose}>Close</button>
                <button style={s.confirmCancelBtn} onClick={() => setShowCloseConfirm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div style={s.dragHandle}><div style={s.dragBar} /></div>

        <div style={s.header}>
          <h2 style={s.title}>Log</h2>
          <button style={s.closeBtn} onClick={handleCloseAttempt}>
            <X size={20} />
          </button>
        </div>

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
                <X size={16} />
              </button>
            )}
          </div>

          {/* Move results */}
          <div style={s.moveList}>
            {q === '' ? (
              <div style={s.emptyState}>Search for a move to log</div>
            ) : filteredMoves.length === 0 ? (
              <div style={s.emptyState}>No moves found</div>
            ) : (
              filteredMoves.map(move => {
                const inSession = !!sessionEntries.find(e => e.moveId === move.id);
                return (
                  <div
                    key={move.id}
                    style={s.moveItem(inSession)}
                    onClick={() => handleSearchResultClick(move)}
                  >
                    {inSession
                      ? <Check size={18} color="#22c55e" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      : <Circle size={18} color="#d1d5db" style={{ flexShrink: 0 }} />
                    }
                    <div style={s.moveInfo}>
                      <span style={s.moveName(inSession)}>{move.name}</span>
                      <span style={s.moveStatusText}>{STATUS_LABELS[move.status] ?? move.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* This session */}
          {sessionEntries.length > 0 && (
            <div style={s.sessionSection}>
              <div style={s.sessionHeader}>
                <span style={s.sessionTitle}>This session</span>
                <span style={s.sessionCount}>{sessionEntries.length}</span>
              </div>
              <div style={s.sessionList}>
                {sessionEntries.map(entry => {
                  const move = moves.find(m => m.id === entry.moveId);
                  return (
                    <div
                      key={entry.moveId}
                      ref={el => { entryRefs.current[entry.moveId] = el; }}
                    >
                      <div style={s.sessionEntry}>
                        <div style={s.entryMain}>
                          <span style={s.entryMoveName}>{move?.name ?? 'Unknown'}</span>
                          <div style={s.entryControls}>
                            <select
                              style={s.statusSelect}
                              value={entry.currentStatus}
                              onChange={e => handleStatusChange(entry.moveId, e.target.value)}
                            >
                              {STATUS_OPTIONS.map(st => (
                                <option key={st} value={st}>{STATUS_LABELS[st]}</option>
                              ))}
                            </select>
                            <button
                              style={s.addNoteBtn(entry.hasNote)}
                              onClick={() => handleToggleNote(entry.moveId)}
                            >
                              {entry.hasNote ? 'Note saved ✓' : 'Add note'}
                            </button>
                          </div>
                        </div>
                        <button
                          style={s.trashBtn}
                          onClick={() => handleRemoveEntry(entry.moveId)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {entry.expandedNote && (
                        <div style={s.expandedForm}>
                          <textarea
                            rows={3}
                            style={s.textarea}
                            value={entry.notes}
                            onChange={e => handleNoteChange(entry.moveId, e.target.value)}
                            placeholder="Add a note..."
                            autoFocus
                          />
                          <div>
                            <button
                              style={s.prevNotesToggle}
                              onClick={() => handleTogglePreviousNotes(entry.moveId)}
                            >
                              Previous notes{' '}
                              {entry.expandedPreviousNotes
                                ? <ChevronUp size={14} />
                                : <ChevronDown size={14} />
                              }
                            </button>
                            {entry.expandedPreviousNotes && (
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
                            <button style={s.cancelNoteBtn} onClick={() => handleCancelNote(entry.moveId)}>
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

        {/* Bottom bar */}
        <div style={s.bottomBar}>
          {reviewButtonVisible && (
            <button style={s.reviewBtn} onClick={() => setMode('review')}>
              Review session →
            </button>
          )}
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
