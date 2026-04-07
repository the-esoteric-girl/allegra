import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft, Edit3, Plus, X } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { Button, StatusPill, StatusOptionButton, ConfirmDialog, Input, IconButton, PageHeader, Card, ComboCard, BottomSheet, MovePickerPanel, EmptyState, PageState } from '../components/ui';
import { filterMovesBySearchAndStatus, sortMoves } from '../lib/moveListControls';
import { MOVE_STATUS_VALUES, getStatusLabel } from '../lib/statusConfig';
import styles from './MoveDetail.module.css';

const TABS = [
  { id: 'info', label: 'Info' },
  { id: 'combos', label: 'Combos' },
];

export default function MoveDetail() {
  const { id } = useParams();
  const { user, moves, combos, transitions, loading, updateMove, deleteMove, addTransition, deleteTransition } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [aliasInputVisible, setAliasInputVisible] = useState(false);
  const [newAlias, setNewAlias] = useState('');
  const [aliasError, setAliasError] = useState('');
  const [aliasConflict, setAliasConflict] = useState(null);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [exitActionError, setExitActionError] = useState('');
  const [isExitPickerOpen, setIsExitPickerOpen] = useState(false);
  const [exitSearchQuery, setExitSearchQuery] = useState('');
  const [exitStatusFilter, setExitStatusFilter] = useState('any');
  const [exitSortBy, setExitSortBy] = useState('alpha-asc');
  const [pendingExitIds, setPendingExitIds] = useState([]);
  const [addingExits, setAddingExits] = useState(false);
  const [removingExitIds, setRemovingExitIds] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }

  if (loading || !Array.isArray(moves)) return <PageState text="Loading..." />;

  const move = moves.find((m) => String(m.id) === id);

  if (!move) return <PageState text="Move not found." />;

  const relatedCombos = combos.filter(c => c.move_ids?.includes(move.id));
  const canDeleteMove = Boolean(user?.id && move?.user_id && String(move.user_id) === String(user.id));
  const moveMap = Object.fromEntries(moves.map((m) => [String(m.id), m]));
  const exits = transitions
    .filter((item) => String(item.from_move_id) === String(move.id))
    .map((item) => moveMap[String(item.to_move_id)])
    .filter(Boolean);
  const existingExitIds = new Set(exits.map((item) => String(item.id)));
  const exitCandidates = sortMoves(
    filterMovesBySearchAndStatus(
      moves.filter((item) =>
        String(item.id) !== String(move.id) &&
        !existingExitIds.has(String(item.id))
      ),
      { searchQuery: exitSearchQuery, statusFilter: exitStatusFilter }
    ),
    exitSortBy
  );

  const statusMenuRef = useRef(null);

  useEffect(() => {
    if (!showStatusMenu) return undefined;

    function handleClickOutside(event) {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
        setShowStatusMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStatusMenu]);

  async function handleStatusChange(nextStatus) {
    if (statusUpdating) return;

    setStatusError('');
    setStatusUpdating(true);

    try {
      const result = await updateMove(move.id, { status: nextStatus || null });
      if (!result.ok) {
        setStatusError('Could not update status. Please try again.');
        return;
      }
    } catch (error) {
      console.error(error);
      setStatusError('Could not update status. Please try again.');
    } finally {
      setStatusUpdating(false);
      setShowStatusMenu(false);
    }
  }

  async function persistAlias(titled) {
    const aliases = Array.isArray(move.aliases) ? move.aliases : [];
    const nextAliases = [...aliases, titled];

    setAliasError('');
    setAliasConflict(null);

    try {
      const result = await updateMove(move.id, { aliases: nextAliases });
      if (!result.ok) {
        setAliasError('Could not add alias. Please try again.');
        return;
      }
      setNewAlias('');
      setAliasInputVisible(false);
    } catch (error) {
      console.error(error);
      setAliasError('Could not add alias. Please try again.');
    }
  }

  async function handleAddAlias() {
    const trimmed = newAlias.trim();
    if (!trimmed) return;
    const titled = toTitleCase(trimmed);
    const aliases = Array.isArray(move.aliases) ? move.aliases : [];

    if (aliases.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      setAliasError('Alias already exists');
      return;
    }

    const nameConflict = moves.find(
      (m) => String(m.id) !== id && m.name.toLowerCase() === titled.toLowerCase()
    );
    if (nameConflict) {
      setAliasConflict({ titled, message: `${titled} already exists as a move in your library. Are you sure you want to add it as an alias?` });
      return;
    }

    const aliasConflictMove = moves.find(
      (m) => String(m.id) !== id && m.aliases && m.aliases.some((a) => a.toLowerCase() === titled.toLowerCase())
    );
    if (aliasConflictMove) {
      setAliasConflict({ titled, message: `${titled} already exists as an alias for ${aliasConflictMove.name}. Are you sure you want to add it as an alias?` });
      return;
    }

    await persistAlias(titled);
  }

  async function handleRemoveAlias(index) {
    const aliases = Array.isArray(move.aliases) ? move.aliases : [];
    const nextAliases = aliases.filter((_, i) => i !== index);

    try {
      const result = await updateMove(move.id, { aliases: nextAliases });
      if (!result.ok) {
        setAliasError('Could not remove alias. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setAliasError('Could not remove alias. Please try again.');
    }
  }

  function handleEditNote() {
    setActiveTab('info');
    setNoteError('');
    setNoteText(move.note || '');
    setEditingNote(true);
  }

  async function handleSaveNote() {
    if (savingNote) return;

    setNoteError('');
    setSavingNote(true);

    try {
      const result = await updateMove(move.id, { note: noteText.trim() || null });
      if (!result.ok) {
        setNoteError('Could not save note. Please try again.');
        return;
      }
      setEditingNote(false);
    } catch (error) {
      console.error(error);
      setNoteError('Could not save note. Please try again.');
    } finally {
      setSavingNote(false);
    }
  }

  async function handleDeleteMove() {
    if (!canDeleteMove) return;
    if (deleting) return;

    setDeleteError('');
    setDeleting(true);
    try {
      const result = await deleteMove(move.id);
      if (!result.ok) {
        setDeleteError('Could not delete move. Please try again.');
        return;
      }
      navigate('/');
    } catch (error) {
      console.error(error);
      setDeleteError('Could not delete move. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  function openExitPicker() {
    setExitActionError('');
    setPendingExitIds([]);
    setExitSearchQuery('');
    setExitStatusFilter('any');
    setExitSortBy('alpha-asc');
    setIsExitPickerOpen(true);
  }

  function togglePendingExit(exitMoveId) {
    setPendingExitIds((prev) =>
      prev.includes(exitMoveId)
        ? prev.filter((item) => item !== exitMoveId)
        : [...prev, exitMoveId]
    );
  }

  async function handleAddExits() {
    if (pendingExitIds.length === 0 || addingExits) return;

    setExitActionError('');
    setAddingExits(true);

    let firstError = null;
    for (const toMoveId of pendingExitIds) {
      const result = await addTransition(move.id, toMoveId);
      if (!result?.ok && !firstError) firstError = result?.error ?? new Error('Unknown transition error');
    }

    setAddingExits(false);

    if (firstError) {
      const isPermissionError = firstError.code === '42501'
        || firstError.status === 403
        || String(firstError.message || '').toLowerCase().includes('permission denied');
      if (isPermissionError) {
        setExitActionError('Could not add exits because database permissions blocked this action (403). Please update your Supabase RLS policy for transitions inserts.');
      } else {
        setExitActionError('Could not add one or more exits. Please try again.');
      }
      return;
    }

    setIsExitPickerOpen(false);
    setPendingExitIds([]);
  }

  async function handleRemoveExit(toMoveId) {
    if (removingExitIds.includes(toMoveId)) return;

    setExitActionError('');
    setRemovingExitIds((prev) => [...prev, toMoveId]);

    const result = await deleteTransition(move.id, toMoveId);
    if (!result.ok) {
      setExitActionError('Could not remove exit. Please try again.');
    }

    setRemovingExitIds((prev) => prev.filter((item) => item !== toMoveId));
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title={move.name || 'Move'}
        leftAction={(
          <IconButton
            icon={<ChevronLeft size={18} />}
            variant="ghost"
            label="Back to library"
            onClick={() => navigate('/')}
          />
        )}
        bleed
        noBorder
        className={styles.pageHeader}
      />

      <div className={styles.moveName}>{move.name}</div>

      {move.aliases && move.aliases.length > 0 && (
        <div className={styles.aliases}>
          aka {move.aliases.join(', ')}
        </div>
      )}

      <div className={styles.tabs} role="tablist" aria-label="Move detail sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <>
          <div className={styles.statusRow}>
            <div className={styles.statusPickerWrap} ref={statusMenuRef}>
              <button
                type="button"
                className={styles.statusPickerBtn}
                onClick={() => setShowStatusMenu((prev) => !prev)}
              >
                <StatusPill status={move.status || ''} size="sm" />
                <span className={styles.statusPickerLabel}>{getStatusLabel(move.status || '').toLowerCase()}</span>
                <ChevronDown size={14} className={styles.statusPickerChevron} />
              </button>
              {showStatusMenu && (
                <div className={styles.statusPickerDropdown}>
                  {['', ...MOVE_STATUS_VALUES].map((status) => (
                    <StatusOptionButton
                      key={status}
                      status={status}
                      label={status ? getStatusLabel(status) : 'No status'}
                      selected={status === (move.status || '')}
                      variant="menu"
                      showCheck
                      onClick={() => handleStatusChange(status)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          {statusError && <p className={styles.actionError}>{statusError}</p>}

          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.sectionLabel}>Alternate names</span>
            </div>
            <div className={styles.aliasSection}>
              {move.aliases && move.aliases.length > 0 ? (
                <div className={styles.aliasTags}>
                  {move.aliases.map((alias, index) => (
                    <span key={index} className={styles.aliasTag}>
                      {alias}
                      <button
                        className={styles.aliasRemove}
                        onClick={() => handleRemoveAlias(index)}
                        type="button"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Plus size={14} />}
                    onClick={() => {
                      setAliasInputVisible(true);
                      setAliasError('');
                      setAliasConflict(null);
                    }}
                  >
                    Add alias
                  </Button>
                </div>
              ) : (
                <div className={styles.aliasEmpty}>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Plus size={14} />}
                    onClick={() => {
                      setAliasInputVisible(true);
                      setAliasError('');
                      setAliasConflict(null);
                    }}
                  >
                    Add alias
                  </Button>
                </div>
              )}

              {aliasInputVisible && (
                <div className={styles.addAliasRow}>
                  <Input
                    id="add-alias"
                    name="add-alias"
                    className={styles.addAliasField}
                    inputClassName={styles.addAliasInput}
                    value={newAlias}
                    onChange={(e) => { setNewAlias(e.target.value); setAliasError(''); setAliasConflict(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAlias()}
                    placeholder="Add alias"
                  />
                  <Button variant="primary" size="sm" onClick={handleAddAlias}>
                    Add
                  </Button>
                </div>
              )}

              {aliasError && <p className={styles.aliasError}>{aliasError}</p>}
              {aliasConflict && (
                <div>
                  <p className={styles.aliasWarning}>{aliasConflict.message}</p>
                  <div className={styles.conflictButtons}>
                    <Button variant="primary" size="sm" onClick={() => persistAlias(aliasConflict.titled)}>
                      Add Anyway
                    </Button>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => {
                        setAliasConflict(null);
                        setNewAlias('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.sectionLabel}>Note</span>
              <Button variant="subtle" size="sm" leftIcon={<Edit3 size={14} />} onClick={handleEditNote}>Edit</Button>
            </div>
            {editingNote ? (
              <div className={styles.addNoteForm}>
                <Input
                  id="note-text"
                  name="note-text"
                  inputClassName={styles.noteTextarea}
                  multiline
                  rows={3}
                  placeholder="Add a technique tip..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  autoFocus
                />
                <div className={styles.addNoteButtons}>
                  <Button variant="primary" size="sm" onClick={handleSaveNote} disabled={savingNote}>
                    {savingNote ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="subtle" size="sm" onClick={() => setEditingNote(false)} disabled={savingNote}>Cancel</Button>
                </div>
                {noteError && <p className={styles.actionError}>{noteError}</p>}
              </div>
            ) : (
              <div className={styles.noteEntry}>
                {move.note ? (
                  <div className={styles.notesText}>{move.note}</div>
                ) : (
                  <div className={styles.notesPlaceholder}>No note yet. Tap edit to add one.</div>
                )}
              </div>
            )}
          </Card>

          <Card className={styles.card} tone="blueTint">
            <div className={styles.cardHeader}>
              <span className={styles.sectionLabel}>Exits to</span>
              <Button variant="subtle" size="sm" leftIcon={<Plus size={14} />} onClick={openExitPicker}>
                Add
              </Button>
            </div>
            {exits.length > 0 ? (
              <div className={styles.exitPills}>
                {exits.map((exitMove) => (
                  <div key={exitMove.id} className={styles.exitPillItem}>
                    <button
                      type="button"
                      className={styles.exitPill}
                      onClick={() => navigate(`/move/${exitMove.id}`)}
                    >
                      {exitMove.name}
                    </button>
                    <button
                      type="button"
                      className={styles.exitPillRemove}
                      onClick={() => handleRemoveExit(exitMove.id)}
                      aria-label={`Remove exit to ${exitMove.name}`}
                      disabled={removingExitIds.includes(exitMove.id)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyStateText}>No exits yet. Add one to start linking transitions.</p>
            )}
            {exitActionError && <p className={styles.actionError}>{exitActionError}</p>}
          </Card>

          {canDeleteMove && (
            <>
              <Button
                variant="ghost"
                className={styles.deleteButton}
                onClick={() => { setDeleteError(''); setIsDeleteDialogOpen(true); }}
                data-testid="delete-move-trigger"
              >
                Delete move
              </Button>
              {deleteError && <p className={styles.actionError}>{deleteError}</p>}
            </>
          )}
        </>
      )}

      {activeTab === 'combos' && (
        <div className={styles.combosSection}>
          {relatedCombos.length > 0 ? (
            <>
              <div className={styles.comboCount}>
                {relatedCombos.length} combo{relatedCombos.length !== 1 ? 's' : ''}
              </div>
              <div className={styles.comboList}>
                {relatedCombos.map((combo) => (
                  <ComboCard
                    key={combo.id}
                    combo={combo}
                    moves={moves}
                    onClick={() => navigate(`/combos/${combo.id}`, { state: { backTo: `/move/${move.id}` } })}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="No combos yet"
              body="This move has not been added to any combos yet."
              className={styles.emptyState}
              titleClassName={styles.emptyHeading}
              bodyClassName={styles.emptyBody}
            />
          )}
        </div>
      )}

      <BottomSheet
        isOpen={isExitPickerOpen}
        onClose={() => setIsExitPickerOpen(false)}
        title="Add exits"
        leftAction={(
          <IconButton
            icon={<ChevronLeft size={20} />}
            label="Close add exits"
            onClick={() => setIsExitPickerOpen(false)}
          />
        )}
        bottomAction={(
          <Button
            fullWidth
            onClick={handleAddExits}
            disabled={pendingExitIds.length === 0 || addingExits}
            leftIcon={<Plus size={16} />}
          >
            {addingExits
              ? 'Adding...'
              : `Add ${pendingExitIds.length} exit${pendingExitIds.length !== 1 ? 's' : ''}`}
          </Button>
        )}
      >
        <MovePickerPanel
          className={styles.exitPickerContent}
          idPrefix="move-exit-picker"
          searchValue={exitSearchQuery}
          onSearchChange={setExitSearchQuery}
          onSearchClear={() => setExitSearchQuery('')}
          statusFilter={exitStatusFilter}
          onStatusFilterChange={setExitStatusFilter}
          sortBy={exitSortBy}
          onSortByChange={setExitSortBy}
          searchPlaceholder="Search moves..."
          items={exitCandidates.map((candidate) => ({
            id: candidate.id,
            label: candidate.name,
            selected: pendingExitIds.includes(candidate.id),
          }))}
          onToggleItem={(candidate) => togglePendingExit(candidate.id)}
          listClassName={styles.exitPickerList}
          dividerClassName={styles.exitPickerDivider}
          emptyState={<p className={styles.emptyStateText}>No available moves to add.</p>}
        />
      </BottomSheet>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete move?"
        message={`"${move.name}" will be permanently removed from your library.`}
        confirmLabel="Delete move"
        cancelLabel="Keep move"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteMove}
        loading={deleting}
        testIdPrefix="delete-move-dialog"
      />
    </div>
  );
}
