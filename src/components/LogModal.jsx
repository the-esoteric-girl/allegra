import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Trash2, X, Plus } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { Button, StatusPill, IconButton, BottomSheet, Input, Card, StatusOptionButton, MovePickerPanel, EmptyState } from './ui';
import { filterMovesBySearchAndStatus, sortMoves } from '../lib/moveListControls';
import { MOVE_STATUS_VALUES, getStatusLabel } from '../lib/statusConfig';
import { cn } from '../lib/cn';
import styles from './LogModal.module.css';

const STATUS_OPTIONS = ['', ...MOVE_STATUS_VALUES];

function formatDate(date) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function AutoTextarea({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  autoFocus,
  ...props
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = 'auto';
    ref.current.style.height = ref.current.scrollHeight + 'px';
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      rows={1}
      autoFocus={autoFocus}
      {...props}
    />
  );
}

export default function LogModal({
  isOpen,
  onClose,
  onMinimize,
  onSaved,
  onDiscard,
  sessionEntries,
  setSessionEntries,
  sessionNotes,
  setSessionNotes,
}) {
  const { moves, updateMove, addMove, createSession, addSessionEntry } = useApp();

  const [mode, setMode] = useState('logging');
  const [searchQuery, setSearchQuery] = useState('');
  const [moveScopeFilter, setMoveScopeFilter] = useState('all');
  const [moveStatusFilter, setMoveStatusFilter] = useState('any');
  const [moveSortBy, setMoveSortBy] = useState('alpha-asc');
  const [pendingIds, setPendingIds] = useState([]);
  const [statusPickerFor, setStatusPickerFor] = useState(null);
  const [createMoveMode, setCreateMoveMode] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', alias: '', status: '' });
  const [expandedSummaryNotes, setExpandedSummaryNotes] = useState([]);

  const searchInputRef = useRef(null);
  const createNameInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const resetTimer = setTimeout(() => {
        setMode('logging');
        setSearchQuery('');
        setMoveScopeFilter('all');
        setMoveStatusFilter('any');
        setMoveSortBy('alpha-asc');
        setPendingIds([]);
        setStatusPickerFor(null);
        setCreateMoveMode(false);
        setExpandedSummaryNotes([]);
      }, 0);
      return () => clearTimeout(resetTimer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode === 'addMoves' && !createMoveMode) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 320);
      return () => clearTimeout(t);
    }
  }, [mode, createMoveMode]);

  useEffect(() => {
    if (createMoveMode) {
      const t = setTimeout(() => createNameInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [createMoveMode]);

  const q = searchQuery.trim().toLowerCase();

  const scopedMoves = moveScopeFilter === 'selected'
    ? moves.filter((m) => sessionEntries.some((e) => e.moveId === m.id) || pendingIds.includes(m.id))
    : moves;

  const shownMoves = sortMoves(
    filterMovesBySearchAndStatus(scopedMoves, {
      searchQuery: q,
      statusFilter: moveStatusFilter,
    }),
    moveSortBy
  );

  const hasSelectedScope = moves.some((move) =>
    sessionEntries.some((e) => e.moveId === move.id) || pendingIds.includes(move.id)
  );
  const noResults = q && shownMoves.length === 0 && moveScopeFilter === 'all';
  const newPendingCount = pendingIds.filter(id => !sessionEntries.some(e => e.moveId === id)).length;

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleOverlayClick() {
    if (mode === 'addMoves') { dismissAddMoves(); return; }
    if (statusPickerFor) { setStatusPickerFor(null); return; }
    if (sessionEntries.length > 0) onMinimize();
    else onClose();
  }

  async function handleStatusChange(moveId, newStatus) {
    setSessionEntries(prev => prev.map(e =>
      e.moveId === moveId ? { ...e, currentStatus: newStatus } : e
    ));
    await updateMove(moveId, { status: newStatus });
  }

  function handleNoteChange(moveId, value) {
    setSessionEntries(prev => prev.map(e =>
      e.moveId === moveId ? { ...e, note: value } : e
    ));
  }

  async function handleNoteBlur(entry) {
    const trimmed = entry.note.trim();
    const savedTrimmed = (entry.savedNote || '').trim();
    if (trimmed === savedTrimmed) return;
    await updateMove(entry.moveId, { note: trimmed || null });
    setSessionEntries(prev => prev.map(e =>
      e.moveId === entry.moveId ? { ...e, savedNote: trimmed } : e
    ));
  }

  async function handleRemoveEntry(moveId) {
    const entry = sessionEntries.find(e => e.moveId === moveId);
    setSessionEntries(prev => prev.filter(e => e.moveId !== moveId));
    if (entry && entry.previousStatus !== entry.currentStatus) {
      await updateMove(moveId, { status: entry.previousStatus });
    }
  }

  function togglePendingId(moveId) {
    if (sessionEntries.some(e => e.moveId === moveId)) return;
    setPendingIds(prev =>
      prev.includes(moveId) ? prev.filter(id => id !== moveId) : [...prev, moveId]
    );
  }

  function handleConfirmAddMoves() {
    const toAdd = pendingIds.filter(id => !sessionEntries.some(e => e.moveId === id));
    const newEntries = toAdd.map(id => {
      const move = moves.find(m => m.id === id);
      return {
        moveId: id,
        previousStatus: move?.status || '',
        currentStatus: move?.status || '',
        note: move.note || '',
        savedNote: move.note || '',
      };
    });
    setSessionEntries(prev => [...prev, ...newEntries]);
    setPendingIds([]);
    setMode('logging');
    setSearchQuery('');
    setMoveScopeFilter('all');
    setMoveStatusFilter('any');
    setMoveSortBy('alpha-asc');
  }

  async function handleCreateMove() {
    const name = createForm.name.trim();
    if (!name) return;
    const aliases = createForm.alias.trim() ? [createForm.alias.trim()] : [];
    const moveResult = await addMove({ name, aliases, status: createForm.status, user_id: null });
    if (!moveResult.ok) return;
    const newMove = moveResult.data;
    setSessionEntries(prev => [...prev, {
      moveId: newMove.id,
      previousStatus: newMove.status,
      currentStatus: newMove.status,
      note: '',
      savedNote: '',
    }]);
    setCreateMoveMode(false);
    setCreateForm({ name: '', alias: '', status: '' });
    setMode('logging');
    setSearchQuery('');
    setMoveScopeFilter('all');
    setMoveStatusFilter('any');
    setMoveSortBy('alpha-asc');
  }

  async function handleSaveSession() {
    const sessionResult = await createSession(sessionNotes);
    if (!sessionResult.ok) return;
    const session = sessionResult.data;
    await Promise.all(
      sessionEntries.map(e => {
        const notesAdded = (e.savedNote || '').trim().length > 0;
        return addSessionEntry(session.id, e.moveId, e.previousStatus, e.currentStatus, notesAdded);
      })
    );
    onSaved();
  }

  function dismissAddMoves() {
    setMode('logging');
    setSearchQuery('');
    setMoveScopeFilter('all');
    setMoveStatusFilter('any');
    setMoveSortBy('alpha-asc');
    setPendingIds([]);
    setCreateMoveMode(false);
  }

  // ── Header ───────────────────────────────────────────────────────────────────

  let title, leftAction, rightAction;
  if (mode === 'summary') {
    title = 'Session summary';
    leftAction = (
      <IconButton
        icon={<ChevronLeft size={20} />}
        onClick={() => setMode('logging')}
        label="Back"
        data-testid="log-summary-back"
      />
    );
    rightAction = (
      <IconButton
        icon={<Trash2 size={18} />}
        onClick={onDiscard}
        label="Discard session"
        data-testid="log-discard-session"
      />
    );
  } else if (mode === 'addMoves' && createMoveMode) {
    title = 'Create move';
    leftAction = (
      <IconButton
        icon={<ChevronLeft size={20} />}
        onClick={() => setCreateMoveMode(false)}
        label="Back"
        data-testid="log-create-move-back"
      />
    );
    rightAction = null;
  } else if (mode === 'addMoves') {
    title = 'Add moves';
    leftAction = (
      <IconButton
        icon={<ChevronLeft size={20} />}
        onClick={dismissAddMoves}
        label="Back"
        data-testid="log-add-moves-back"
      />
    );
    rightAction = null;
  } else {
    title = 'Log session';
    leftAction = null;
    rightAction = sessionEntries.length > 0
      ? (
        <IconButton
          icon={<ChevronRight size={20} />}
          onClick={() => setMode('summary')}
          label="Review session"
          data-testid="log-review-session"
        />
      )
      : null;
  }

  // ── Bottom action ────────────────────────────────────────────────────────────

  let bottomAction;
  if (mode === 'summary') {
    bottomAction = (
      <Button variant="primary" fullWidth onClick={handleSaveSession} data-testid="log-session-submit">
        Log session
      </Button>
    );
  } else if (mode === 'addMoves' && createMoveMode) {
    bottomAction = (
      <div className={styles.createFormActions}>
        <Button variant="primary" fullWidth onClick={handleCreateMove} data-testid="log-create-move-submit">
          Create move
        </Button>
        <Button variant="ghost" fullWidth onClick={() => setCreateMoveMode(false)} data-testid="log-create-move-cancel">
          Cancel
        </Button>
      </div>
    );
  } else if (mode === 'addMoves') {
    bottomAction = newPendingCount > 0
      ? (
        <Button
          variant="primary"
          fullWidth
          leftIcon={<Plus size={16} />}
          onClick={handleConfirmAddMoves}
          data-testid="log-add-selected-moves"
        >
          Add {newPendingCount} {newPendingCount === 1 ? 'move' : 'moves'}
        </Button>
      )
      : null;
  } else {
    bottomAction = sessionEntries.length > 0
      ? (
        <Button
          variant="primary"
          fullWidth
          leftIcon={<Plus size={16} />}
          onClick={() => { setMode('addMoves'); setPendingIds([]); }}
          data-testid="log-open-add-moves"
        >
          Add move
        </Button>
      )
      : null;
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleOverlayClick}
      title={title}
      leftAction={leftAction}
      rightAction={rightAction}
      bottomAction={bottomAction}
    >
      {mode === 'summary' ? (
        <div className={styles.scrollContent}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryMeta}>
              <div className={styles.summaryMetaItem}>
                <span className={styles.summaryMetaLabel}>When</span>
                <span className={styles.summaryMetaValue}>{formatDate(new Date())}</span>
              </div>
              <div className={styles.summaryMetaItem}>
                <span className={styles.summaryMetaLabel}>Moves</span>
                <span className={styles.summaryMetaValue}>{sessionEntries.length}</span>
              </div>
            </div>
            {sessionNotes.trim() && (
              <div className={styles.summaryNotesBlock}>
                <span className={styles.summaryMetaLabel}>Notes</span>
                <p className={styles.summaryNotesText}>{sessionNotes}</p>
              </div>
            )}
          </div>

          <div className={styles.summaryEntries}>
            {sessionEntries.map(entry => {
              const move = moves.find(m => m.id === entry.moveId);
              const isExpanded = expandedSummaryNotes.includes(entry.moveId);
              const noteText = entry.savedNote?.trim();
              return (
                <Card key={entry.moveId} className={styles.summaryEntry}>
                  <div className={styles.summaryEntryRow}>
                    <span className={styles.summaryEntryName}>{move?.name ?? 'Unknown'}</span>
                    <StatusPill status={entry.currentStatus} size="sm" />
                  </div>
                  {noteText && (
                    <p
                      className={cn(
                        styles.summaryEntryNote,
                        !isExpanded && styles.summaryEntryNoteClamped
                      )}
                      onClick={() => setExpandedSummaryNotes(prev =>
                        isExpanded
                          ? prev.filter(id => id !== entry.moveId)
                          : [...prev, entry.moveId]
                      )}
                    >
                      {noteText}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={styles.slidingWrapper}>
          <div className={cn(styles.slidingTrack, mode === 'addMoves' && styles.slidingTrackActive)}>

            {/* ── Panel 1: Logging ── */}
            <div className={styles.panel}>
              <div className={styles.scrollContent}>
                <div className={styles.sessionNoteWrap}>
                  <Input
                    id="log-session-notes"
                    name="log-session-notes"
                    multiline
                    rows={3}
                    value={sessionNotes}
                    onChange={e => setSessionNotes(e.target.value)}
                    placeholder="How's the session going?"
                    data-testid="log-session-notes"
                  />
                </div>

                {sessionEntries.length === 0 ? (
                  <EmptyState
                    title="It's a whole new world…"
                    body="Add moves to start logging this session!"
                    className={styles.emptyState}
                    titleClassName={styles.emptyTitle}
                    bodyClassName={styles.emptySubtitle}
                    action={(
                      <Button
                        variant="primary"
                        leftIcon={<Plus size={16} />}
                        onClick={() => { setMode('addMoves'); setPendingIds([]); }}
                        data-testid="log-empty-add-move"
                      >
                        Add move
                      </Button>
                    )}
                  />
                ) : (
                  <div className={styles.entriesList}>
                    {sessionEntries.map(entry => {
                      const move = moves.find(m => m.id === entry.moveId);
                      return (
                        <Card key={entry.moveId} className={styles.entryCard}>
                          <div className={styles.entryRow}>
                            <span className={styles.entryName}>{move?.name ?? 'Unknown'}</span>
                            <div className={styles.entryActions}>
                              <div className={styles.statusPickerWrap}>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className={styles.statusPillBtn}
                                  onClick={() => setStatusPickerFor(
                                    prev => prev === entry.moveId ? null : entry.moveId
                                  )}
                                >
                                  <StatusPill status={entry.currentStatus} size="sm" />
                                </Button>
                                {statusPickerFor === entry.moveId && (
                                  <div className={styles.pickerDropdown}>
                                    {STATUS_OPTIONS.map(s => (
                                      <StatusOptionButton
                                        key={s}
                                        status={s}
                                        label={getStatusLabel(s)}
                                        selected={s === entry.currentStatus}
                                        variant="menu"
                                        showCheck
                                        onClick={() => {
                                          handleStatusChange(entry.moveId, s);
                                          setStatusPickerFor(null);
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                              <IconButton
                                icon={<X size={16} />}
                                onClick={() => handleRemoveEntry(entry.moveId)}
                                label="Remove move"
                                variant="ghost"
                                size="sm"
                                className={styles.entryDeleteBtn}
                              />
                            </div>
                          </div>
                          <AutoTextarea
                            value={entry.note}
                            onChange={e => handleNoteChange(entry.moveId, e.target.value)}
                            onBlur={() => handleNoteBlur(entry)}
                            placeholder="Add note…"
                            className={styles.entryNoteTextarea}
                          />
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Panel 2: Add moves / Create move ── */}
            <div className={styles.panel}>
              {createMoveMode ? (
                <div className={styles.createMoveForm}>
                  <Input
                    inputRef={createNameInputRef}
                    id="create-name"
                    name="create-name"
                    inputClassName={styles.createInput}
                    placeholder="Move name"
                    value={createForm.name}
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  />
                  <Input
                    id="create-alias"
                    name="create-alias"
                    inputClassName={styles.createInput}
                    placeholder="Alias (optional)"
                    value={createForm.alias}
                    onChange={e => setCreateForm(f => ({ ...f, alias: e.target.value }))}
                  />
                  <div className={styles.createStatusRow}>
                    {STATUS_OPTIONS.map(s => (
                      <StatusOptionButton
                        key={s}
                        status={s}
                        label={getStatusLabel(s)}
                        selected={createForm.status === s}
                        variant="list"
                        onClick={() => setCreateForm(f => ({ ...f, status: s }))}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <MovePickerPanel
                    idPrefix="log-add"
                    searchValue={searchQuery}
                    onSearchChange={(next) => {
                      setSearchQuery(next);
                      setMoveScopeFilter('all');
                    }}
                    onSearchClear={() => setSearchQuery('')}
                    statusFilter={moveStatusFilter}
                    onStatusFilterChange={setMoveStatusFilter}
                    sortBy={moveSortBy}
                    onSortByChange={setMoveSortBy}
                    searchPlaceholder="Search moves"
                    searchInputRef={searchInputRef}
                    controlsClassName={styles.addMovesControls}
                    searchClassName={styles.searchInputWrap}
                    searchInputClassName={styles.searchInput}
                    scopeValue={moveScopeFilter}
                    onScopeChange={setMoveScopeFilter}
                    scopeOptions={[
                      { value: 'all', label: 'All' },
                      ...(hasSelectedScope ? [{ value: 'selected', label: 'Selected' }] : []),
                    ]}
                    scopeClassName={styles.scopeRow}
                    items={shownMoves.map((move) => {
                      const inSession = sessionEntries.some((e) => e.moveId === move.id);
                      return {
                        id: move.id,
                        label: move.name,
                        selected: inSession || pendingIds.includes(move.id),
                        disabled: inSession,
                      };
                    })}
                    onToggleItem={(item) => togglePendingId(item.id)}
                    listClassName={styles.moveSearchList}
                    rowClassName={styles.moveSearchItem}
                    checkboxClassName={styles.moveCheckbox}
                    labelClassName={styles.moveSearchName}
                    dividerClassName={styles.moveRowDivider}
                    emptyState={noResults ? (
                      <div className={styles.noResultsState}>
                        <p className={styles.noResultsText}>No results for "{searchQuery}"</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          leftIcon={<Plus size={16} />}
                          className={styles.createMoveLink}
                          onClick={() => {
                            setCreateForm({ name: searchQuery, alias: '', status: '' });
                            setCreateMoveMode(true);
                          }}
                          data-testid="log-create-custom-move"
                        >
                          Create custom move
                        </Button>
                      </div>
                    ) : null}
                  />
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </BottomSheet>
  );
}
