import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';

const STATUS_CONFIG = {
  'want to try': { label: 'Want to try', color: '#9ca3af' },
  'working on':  { label: 'Working on',  color: '#f59e0b' },
  'achieved':    { label: 'Achieved',    color: '#22c55e' },
};

function formatDatestamp(date) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = months[date.getMonth()];
  const d = date.getDate();
  const y = date.getFullYear();
  return y === new Date().getFullYear() ? `${m} ${d}` : `${m} ${d}, ${y}`;
}

function Checkmark({ color = '#22c55e', size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 10" fill="none">
      <path d="M1 5l3.5 3.5L11 1" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LogModal({ isOpen, onClose }) {
  const { moves, updateMove } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery]                   = useState('');
  const [sessionLog, setSessionLog]                     = useState([]);
  // sessionLog entries: { moveId, status, notes, isPending, hasNote }
  const [expandedEntryId, setExpandedEntryId]           = useState(null);
  const [expandedNewNote, setExpandedNewNote]           = useState('');
  const [expandedStatus, setExpandedStatus]             = useState('want to try');
  const [isPrevNotesOpen, setIsPrevNotesOpen]           = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [saveSuccess, setSaveSuccess]                   = useState(false);
  const [saveError, setSaveError]                       = useState(null);

  const entryRefs = useRef({});

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSessionLog([]);
      setExpandedEntryId(null);
      setExpandedNewNote('');
      setExpandedStatus('want to try');
      setIsPrevNotesOpen(false);
      setIsStatusDropdownOpen(false);
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

  const pendingEntries = sessionLog.filter(e => e.isPending);

  function flash() {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }

  function handleMoveToggle(move) {
    const existing = sessionLog.find(e => e.moveId === move.id);
    if (existing && !existing.isPending) return; // confirmed — cannot deselect
    if (existing && existing.isPending) {
      setSessionLog(prev => prev.filter(e => e.moveId !== move.id));
      if (expandedEntryId === move.id) setExpandedEntryId(null);
    } else {
      setSessionLog(prev => [...prev, {
        moveId: move.id,
        status: move.status,
        notes: '',
        isPending: true,
        hasNote: false,
      }]);
    }
  }

  function handleEntryClick(entry) {
    if (expandedEntryId === entry.moveId) {
      setExpandedEntryId(null);
      return;
    }
    setExpandedEntryId(entry.moveId);
    setExpandedNewNote('');
    setExpandedStatus(entry.status);
    setIsPrevNotesOpen(false);
  }

  async function handleEntrySave(entry) {
    setSaveError(null);
    const move = moves.find(m => m.id === entry.moveId);
    let notesToSave = move?.notes || '';
    if (expandedNewNote.trim()) {
      const stamp = formatDatestamp(new Date());
      notesToSave = `[${stamp}] ${expandedNewNote.trim()}${notesToSave ? '\n' + notesToSave : ''}`;
    }
    try {
      await updateMove(entry.moveId, { status: expandedStatus, notes: notesToSave });
      setSessionLog(prev => prev.map(e =>
        e.moveId === entry.moveId
          ? { ...e, status: expandedStatus, notes: expandedNewNote, isPending: false, hasNote: !!expandedNewNote.trim() }
          : e
      ));
      setExpandedEntryId(null);
      flash();
    } catch {
      setSaveError('Failed to save. Please try again.');
    }
  }

  function handleSetStatus(status) {
    setSessionLog(prev => prev.map(e => e.isPending ? { ...e, status } : e));
    setIsStatusDropdownOpen(false);
  }

  function handleActionAddNote() {
    if (pendingEntries.length !== 1) return;
    const entry = pendingEntries[0];
    setExpandedEntryId(entry.moveId);
    setExpandedNewNote('');
    setExpandedStatus(entry.status);
    setIsPrevNotesOpen(false);
    setTimeout(() => {
      const el = entryRefs.current[entry.moveId];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }

  async function handleDone() {
    setSaveError(null);
    try {
      await Promise.all(pendingEntries.map(e => updateMove(e.moveId, { status: e.status })));
      setSessionLog(prev => prev.map(e => e.isPending ? { ...e, isPending: false } : e));
      flash();
    } catch {
      setSaveError('Failed to save. Please try again.');
    }
  }

  const statusBtnLabel = pendingEntries.length === 1
    ? `${STATUS_CONFIG[pendingEntries[0].status]?.label ?? pendingEntries[0].status} \u25be`
    : `Set status \u25be`;

  // ── Styles ───────────────────────────────────────────────────────────────────

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

    // Scrollable content area
    contentArea: {
      flex: 1, minHeight: 0,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    },

    // Search
    searchWrap: { padding: '0 16px 10px', flexShrink: 0 },
    searchInput: {
      width: '100%', boxSizing: 'border-box',
      padding: '10px 14px', fontSize: '15px',
      border: '1px solid #e5e7eb', borderRadius: '10px',
      outline: 'none', backgroundColor: '#f9fafb',
    },

    // Move list
    moveList: { flex: 1, minHeight: 0, overflowY: 'auto' },
    emptyState: {
      padding: '32px 16px', textAlign: 'center',
      color: '#9ca3af', fontSize: '14px',
    },
    moveItem: (inSession) => ({
      display: 'flex', alignItems: 'center',
      padding: '11px 16px', gap: '10px',
      cursor: 'pointer',
      backgroundColor: inSession ? '#f0fdf4' : 'transparent',
      borderBottom: '1px solid #f5f5f5',
    }),
    moveInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
    moveName: { fontSize: '15px', color: '#111' },
    moveStatusText: { fontSize: '12px', color: '#9ca3af' },

    // This session
    sessionSection: {
      flexShrink: 0,
      borderTop: '2px solid #f0f0f0',
      display: 'flex', flexDirection: 'column',
      maxHeight: '40%',
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
      padding: '9px 16px', gap: '8px',
      cursor: 'pointer', borderBottom: '1px solid #f5f5f5',
    },
    entryMoveName: { flex: 1, fontSize: '14px', color: '#374151' },
    statusBadge: (color) => ({
      fontSize: '11px', fontWeight: 500,
      color: color,
      backgroundColor: color + '1a',
      padding: '2px 7px', borderRadius: '99px',
      flexShrink: 0,
    }),
    pendingDot: {
      fontSize: '18px', color: '#d1d5db',
      lineHeight: 1, flexShrink: 0,
    },
    noteIndicator: { fontSize: '13px', flexShrink: 0 },

    // Expanded inline form
    expandedForm: {
      padding: '12px 16px 14px',
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex', flexDirection: 'column', gap: '10px',
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
    statusRow: { display: 'flex', gap: '6px' },
    statusBtn: (active) => ({
      flex: 1, padding: '7px 4px', fontSize: '12px',
      border: `1.5px solid ${active ? '#3b82f6' : '#e5e7eb'}`,
      borderRadius: '8px', cursor: 'pointer',
      backgroundColor: active ? '#eff6ff' : '#fff',
      color: active ? '#1d4ed8' : '#6b7280',
      fontWeight: active ? 600 : 400,
    }),
    formActions: { display: 'flex', gap: '8px' },
    saveBtn: {
      flex: 1, padding: '9px', fontSize: '14px',
      border: 'none', borderRadius: '8px', cursor: 'pointer',
      backgroundColor: '#3b82f6', color: '#fff', fontWeight: 600,
    },
    cancelBtn: {
      flex: 1, padding: '9px', fontSize: '14px',
      border: '1px solid #e5e7eb', borderRadius: '8px',
      cursor: 'pointer', backgroundColor: '#fff', color: '#374151',
    },

    // Banners
    banner: (type) => ({
      margin: '0 16px 4px',
      padding: '7px 12px',
      borderRadius: '8px',
      fontSize: '13px', fontWeight: 500,
      textAlign: 'center', flexShrink: 0,
      backgroundColor: type === 'success' ? '#dcfce7' : '#fee2e2',
      color: type === 'success' ? '#16a34a' : '#dc2626',
    }),

    // Action bar
    actionBar: {
      borderTop: '1px solid #f0f0f0',
      padding: '10px 16px',
      flexShrink: 0,
      backgroundColor: '#fafafa',
    },
    actionTop: {
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px',
    },
    pendingCount: { fontSize: '13px', color: '#6b7280', fontWeight: 500 },
    actionButtons: { display: 'flex', gap: '8px' },
    setStatusWrap: { flex: 1, position: 'relative' },
    setStatusBtn: {
      width: '100%', padding: '9px 8px', fontSize: '13px',
      border: '1px solid #e5e7eb', borderRadius: '8px',
      cursor: 'pointer', backgroundColor: '#fff', color: '#374151',
    },
    dropdown: {
      position: 'absolute',
      bottom: 'calc(100% + 4px)', left: 0,
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      zIndex: 10, minWidth: '150px',
    },
    dropdownItem: {
      display: 'block', width: '100%',
      padding: '11px 16px', fontSize: '14px',
      border: 'none', background: 'none',
      cursor: 'pointer', textAlign: 'left', color: '#374151',
    },
    addNoteBtn: (disabled) => ({
      flex: 1, padding: '9px 8px', fontSize: '13px',
      border: '1px solid #e5e7eb', borderRadius: '8px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      backgroundColor: disabled ? '#f5f5f5' : '#fff',
      color: disabled ? '#c4c4c4' : '#374151',
    }),
    doneBtn: {
      flex: 1, padding: '9px 8px', fontSize: '13px',
      border: 'none', borderRadius: '8px', cursor: 'pointer',
      backgroundColor: '#3b82f6', color: '#fff', fontWeight: 600,
    },

    // Footer
    footer: {
      borderTop: '1px solid #f0f0f0',
      padding: '12px 16px',
      flexShrink: 0,
    },
    newComboBtn: {
      width: '100%', padding: '11px',
      border: '1px solid #e5e7eb', borderRadius: '10px',
      cursor: 'pointer', backgroundColor: '#fff',
      fontSize: '14px', color: '#374151', fontWeight: 500,
    },
  };

  // ── Render ───────────────────────────────────────────────────────────────────

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

        {/* Content (search + move list + this session) */}
        <div style={s.contentArea}>

          {/* Search input */}
          <div style={s.searchWrap}>
            <input
              type="text"
              placeholder="Search for a move..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={s.searchInput}
            />
          </div>

          {/* Move list */}
          <div style={s.moveList}>
            {q === '' ? (
              <div style={s.emptyState}>Search for a move to log</div>
            ) : filteredMoves.length === 0 ? (
              <div style={s.emptyState}>No moves found</div>
            ) : (
              filteredMoves.map(move => {
                const logEntry = sessionLog.find(e => e.moveId === move.id);
                const inSession = !!logEntry;
                return (
                  <div
                    key={move.id}
                    style={s.moveItem(inSession)}
                    onClick={() => handleMoveToggle(move)}
                  >
                    <div style={s.moveInfo}>
                      <span style={s.moveName}>{move.name}</span>
                      <span style={s.moveStatusText}>
                        {STATUS_CONFIG[move.status]?.label ?? move.status}
                      </span>
                    </div>
                    {inSession && <Checkmark color="#22c55e" size={16} />}
                  </div>
                );
              })
            )}
          </div>

          {/* This session */}
          <div style={s.sessionSection}>
            <div style={s.sessionHeader}>
              <span style={s.sessionTitle}>This session</span>
              <span style={s.sessionCount}>{sessionLog.length}</span>
            </div>
            <div style={s.sessionList}>
              {sessionLog.map(entry => {
                const move = moves.find(m => m.id === entry.moveId);
                const isExpanded = expandedEntryId === entry.moveId;
                const cfg = STATUS_CONFIG[entry.status];
                return (
                  <div
                    key={entry.moveId}
                    ref={el => { entryRefs.current[entry.moveId] = el; }}
                  >
                    <div style={s.sessionEntry} onClick={() => handleEntryClick(entry)}>
                      <span style={s.entryMoveName}>{move?.name ?? 'Unknown'}</span>
                      <span style={s.statusBadge(cfg?.color ?? '#9ca3af')}>
                        {cfg?.label ?? entry.status}
                      </span>
                      {entry.isPending
                        ? <span style={s.pendingDot}>·</span>
                        : <Checkmark color="#22c55e" size={13} />
                      }
                      {entry.hasNote && <span style={s.noteIndicator}>📝</span>}
                    </div>

                    {isExpanded && (
                      <div style={s.expandedForm}>
                        {/* Note textarea */}
                        <textarea
                          rows={3}
                          style={s.textarea}
                          value={expandedNewNote}
                          onChange={e => setExpandedNewNote(e.target.value)}
                          placeholder="Add a note..."
                        />

                        {/* Previous notes */}
                        <div>
                          <button
                            style={s.prevNotesToggle}
                            onClick={() => setIsPrevNotesOpen(o => !o)}
                          >
                            Previous notes {isPrevNotesOpen ? '▼' : '▶'}
                          </button>
                          {isPrevNotesOpen && (
                            <div style={s.prevNotesContent}>
                              {move?.notes
                                ? move.notes
                                : <span style={{ color: '#c4c4c4' }}>No previous notes</span>
                              }
                            </div>
                          )}
                        </div>

                        {/* Status selector */}
                        <div style={s.statusRow}>
                          {['want to try', 'working on', 'achieved'].map(st => (
                            <button
                              key={st}
                              style={s.statusBtn(expandedStatus === st)}
                              onClick={() => setExpandedStatus(st)}
                            >
                              {STATUS_CONFIG[st].label}
                            </button>
                          ))}
                        </div>

                        {/* Save / Cancel */}
                        <div style={s.formActions}>
                          <button style={s.saveBtn} onClick={() => handleEntrySave(entry)}>
                            Save
                          </button>
                          <button style={s.cancelBtn} onClick={() => setExpandedEntryId(null)}>
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
        </div>

        {/* Banners */}
        {saveSuccess && <div style={s.banner('success')}>Saved ✓</div>}
        {saveError   && <div style={s.banner('error')}>{saveError}</div>}

        {/* Action bar — only when pending moves exist */}
        {pendingEntries.length > 0 && (
          <div style={s.actionBar}>
            <div style={s.actionTop}>
              <span style={s.pendingCount}>{pendingEntries.length} pending</span>
            </div>
            <div style={s.actionButtons}>

              {/* Status button + dropdown */}
              <div style={s.setStatusWrap}>
                {isStatusDropdownOpen && (
                  <div style={s.dropdown}>
                    {['want to try', 'working on', 'achieved'].map(st => (
                      <button
                        key={st}
                        style={s.dropdownItem}
                        onClick={() => handleSetStatus(st)}
                      >
                        {STATUS_CONFIG[st].label}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  style={s.setStatusBtn}
                  onClick={() => setIsStatusDropdownOpen(o => !o)}
                >
                  {statusBtnLabel}
                </button>
              </div>

              {/* Add note */}
              <button
                style={s.addNoteBtn(pendingEntries.length !== 1)}
                disabled={pendingEntries.length !== 1}
                onClick={handleActionAddNote}
              >
                Add note
              </button>

              {/* Done */}
              <button style={s.doneBtn} onClick={handleDone}>
                Done
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={s.footer}>
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
