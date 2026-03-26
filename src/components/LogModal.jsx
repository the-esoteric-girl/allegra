import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { Trash2, X, ChevronDown, ChevronUp, Check, Circle } from 'lucide-react';
import styles from './LogModal.module.css';

const STATUS_OPTIONS = ['want to try', 'working on', 'achieved'];
const STATUS_LABELS = {
  'want to try': 'Want to try',
  'working on': 'Working on',
  'achieved': 'Achieved',
};

function formatReviewDate(date) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function LogModal({ isOpen, onClose }) {
  const { moves, updateMove, addMoveNote, createSession, addSessionEntry } = useApp();
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
    const trimmed = entry.notes.trim();
    if (!trimmed) {
      setSessionEntries(prev => prev.map(e =>
        e.moveId === entry.moveId
          ? { ...e, expandedNote: false, expandedPreviousNotes: false }
          : e
      ));
      return;
    }
    await addMoveNote(entry.moveId, trimmed, null);
    setSessionEntries(prev => prev.map(e =>
      e.moveId === entry.moveId
        ? { ...e, hasNote: true, savedNoteText: trimmed, expandedNote: false, notes: '', expandedPreviousNotes: false }
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

  // ── Review mode ──────────────────────────────────────────────────────────────

  if (mode === 'review') {
    return (
      <div className={styles.overlay}>
        <div className={styles.sheet}>
          <div className={styles.dragHandle}><div className={styles.dragBar} /></div>

          <div className={styles.header}>
            <h2 className={styles.title}>Session summary</h2>
          </div>

          <div className={styles.reviewContent}>
            <div className={styles.reviewDate}>{formatReviewDate(new Date())}</div>

            {sessionEntries.map(entry => {
              const move = moves.find(m => m.id === entry.moveId);
              const statusChanged = entry.previousStatus !== entry.currentStatus;
              const showNote = entry.hasNote && entry.savedNoteText;
              const isNoteExpanded = expandedReviewNote.includes(entry.moveId);
              const noteLong = showNote && (
                entry.savedNoteText.length > 100 || entry.savedNoteText.includes('\n')
              );
              return (
                <div key={entry.moveId} className={styles.reviewEntry}>
                  <span className={styles.reviewMoveName}>{move?.name ?? 'Unknown'}</span>
                  <div className={styles.reviewStatusRow}>
                    {statusChanged ? (
                      <>
                        <span>{STATUS_LABELS[entry.previousStatus] ?? entry.previousStatus}</span>
                        <span>→</span>
                        <span className={styles.reviewStatusNew}>
                          {STATUS_LABELS[entry.currentStatus] ?? entry.currentStatus}
                        </span>
                      </>
                    ) : (
                      <span>{STATUS_LABELS[entry.currentStatus] ?? entry.currentStatus}</span>
                    )}
                  </div>
                  {showNote && (
                    <>
                      <p className={isNoteExpanded ? styles.reviewNoteText : styles.reviewNoteTextClamped}>
                        {entry.savedNoteText}
                      </p>
                      {noteLong && (
                        <button
                          className={styles.reviewNoteToggle}
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
              className={styles.sessionNotesTextarea}
              value={sessionNotes}
              onChange={e => setSessionNotes(e.target.value)}
              placeholder="How did it go? Any overall notes..."
            />
          </div>

          <div className={styles.bottomBar}>
            <button className={styles.backBtn} onClick={() => setMode('logging')}>← Back</button>
            <button className={styles.saveSessionBtn} onClick={handleSaveSession}>Save session</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Logging mode ─────────────────────────────────────────────────────────────

  return (
    <div className={styles.overlay} onClick={handleCloseAttempt}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>

        {showCloseConfirm && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmBox}>
              <p className={styles.confirmText}>You have unsaved moves. Close anyway?</p>
              <div className={styles.confirmActions}>
                <button className={styles.confirmCloseBtn} onClick={onClose}>Close</button>
                <button className={styles.confirmCancelBtn} onClick={() => setShowCloseConfirm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.dragHandle}><div className={styles.dragBar} /></div>

        <div className={styles.header}>
          <h2 className={styles.title}>Log</h2>
          <button className={styles.closeBtn} onClick={handleCloseAttempt}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.contentArea}>

          {/* Search */}
          <div className={styles.searchWrap}>
            <input
              type="text"
              placeholder="Search for a move..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button className={styles.searchClear} onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Move results */}
          <div className={styles.moveList}>
            {q === '' ? (
              <div className={styles.emptyState}>Search for a move to log</div>
            ) : filteredMoves.length === 0 ? (
              <div className={styles.emptyState}>No moves found</div>
            ) : (
              filteredMoves.map(move => {
                const inSession = !!sessionEntries.find(e => e.moveId === move.id);
                return (
                  <div
                    key={move.id}
                    className={inSession ? styles.moveItemInSession : styles.moveItem}
                    onClick={() => handleSearchResultClick(move)}
                  >
                    {inSession
                      ? <Check size={18} color="var(--color-green)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      : <Circle size={18} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                    }
                    <div className={styles.moveInfo}>
                      <span className={inSession ? styles.moveNameInSession : styles.moveName}>{move.name}</span>
                      <span className={styles.moveStatusText}>{STATUS_LABELS[move.status] ?? move.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* This session */}
          {sessionEntries.length > 0 && (
            <div className={styles.sessionSection}>
              <div className={styles.sessionHeader}>
                <span className={styles.sessionTitle}>This session</span>
                <span className={styles.sessionCount}>{sessionEntries.length}</span>
              </div>
              <div className={styles.sessionList}>
                {sessionEntries.map(entry => {
                  const move = moves.find(m => m.id === entry.moveId);
                  return (
                    <div
                      key={entry.moveId}
                      ref={el => { entryRefs.current[entry.moveId] = el; }}
                    >
                      <div className={styles.sessionEntry}>
                        <div className={styles.entryMain}>
                          <span className={styles.entryMoveName}>{move?.name ?? 'Unknown'}</span>
                          <div className={styles.entryControls}>
                            <select
                              className={styles.statusSelect}
                              value={entry.currentStatus}
                              onChange={e => handleStatusChange(entry.moveId, e.target.value)}
                            >
                              {STATUS_OPTIONS.map(st => (
                                <option key={st} value={st}>{STATUS_LABELS[st]}</option>
                              ))}
                            </select>
                            <button
                              className={entry.hasNote ? styles.addNoteBtnSaved : styles.addNoteBtn}
                              onClick={() => handleToggleNote(entry.moveId)}
                            >
                              {entry.hasNote ? 'Note saved ✓' : 'Add note'}
                            </button>
                          </div>
                        </div>
                        <button
                          className={styles.trashBtn}
                          onClick={() => handleRemoveEntry(entry.moveId)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {entry.expandedNote && (
                        <div className={styles.expandedForm}>
                          <textarea
                            rows={3}
                            className={styles.textarea}
                            value={entry.notes}
                            onChange={e => handleNoteChange(entry.moveId, e.target.value)}
                            placeholder="Add a note..."
                            autoFocus
                          />
                          <div className={styles.noteActions}>
                            <button className={styles.saveNoteBtn} onClick={() => handleSaveNote(entry)}>
                              Save note
                            </button>
                            <button className={styles.cancelNoteBtn} onClick={() => handleCancelNote(entry.moveId)}>
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
        <div className={styles.bottomBar}>
          {reviewButtonVisible && (
            <button className={styles.reviewBtn} onClick={() => setMode('review')}>
              Review session →
            </button>
          )}
          <button
            className={styles.newComboBtn}
            onClick={() => { onClose(); navigate('/combos'); }}
          >
            + New combo
          </button>
        </div>

      </div>
    </div>
  );
}
