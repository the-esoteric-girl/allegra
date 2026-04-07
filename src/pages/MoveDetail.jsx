import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, X } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { Button, StatusPill, ConfirmDialog, Select, Input, Field, IconButton, PageHeader, Card, ComboCard, BottomSheet, MoveListControls, MoveSelectRow } from '../components/ui';
import { filterMovesBySearchAndStatus, sortMoves } from '../lib/moveListControls';
import styles from './MoveDetail.module.css';

const TABS = [
  { id: 'info', label: 'Info' },
  { id: 'combos', label: 'Combos' },
];

export default function MoveDetail() {
  const { id } = useParams();
  const { moves, combos, transitions, loading, updateMove, deleteMove, addTransition, deleteTransition } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [editing, setEditing] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editAliases, setEditAliases] = useState([]);
  const [newAlias, setNewAlias] = useState('');
  const [aliasError, setAliasError] = useState('');
  const [aliasConflict, setAliasConflict] = useState(null);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [saveError, setSaveError] = useState('');
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

  if (loading) return <p>Loading...</p>;

  const move = moves.find((m) => String(m.id) === id);

  if (!move) return <p>Move not found</p>;

  const relatedCombos = combos.filter(c => c.move_ids?.includes(move.id));
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

  function handleEditClick() {
    setActiveTab('info');
    setEditStatus(move.status || '');
    setEditAliases(move.aliases ? [...move.aliases] : []);
    setNewAlias('');
    setAliasError('');
    setAliasConflict(null);
    setSaveError('');
    setEditing(true);
  }

  function addAlias(titled) {
    setEditAliases((prev) => [...prev, titled]);
    setNewAlias('');
    setAliasError('');
    setAliasConflict(null);
  }

  function handleAddAlias() {
    const trimmed = newAlias.trim();
    if (!trimmed) return;
    const titled = toTitleCase(trimmed);
    if (editAliases.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
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
    addAlias(titled);
  }

  function handleRemoveAlias(index) {
    setEditAliases(editAliases.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (savingDetails) return;

    setSaveError('');
    setSavingDetails(true);

    try {
      const success = await updateMove(move.id, { status: editStatus, aliases: editAliases });
      if (success === false) {
        setSaveError('Could not save changes. Please try again.');
        return;
      }
      setEditing(false);
    } catch (error) {
      console.error(error);
      setSaveError('Could not save changes. Please try again.');
    } finally {
      setSavingDetails(false);
    }
  }

  function handleCancel() {
    setSaveError('');
    setAliasError('');
    setAliasConflict(null);
    setEditing(false);
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
      const success = await updateMove(move.id, { note: noteText.trim() || null });
      if (success === false) {
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
    if (deleting) return;

    setDeleteError('');
    setDeleting(true);
    try {
      const success = await deleteMove(move.id);
      if (success === false) {
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

    let hasError = false;
    for (const toMoveId of pendingExitIds) {
      const success = await addTransition(move.id, toMoveId);
      if (!success) hasError = true;
    }

    setAddingExits(false);

    if (hasError) {
      setExitActionError('Could not add one or more exits. Please try again.');
      return;
    }

    setIsExitPickerOpen(false);
    setPendingExitIds([]);
  }

  async function handleRemoveExit(toMoveId) {
    if (removingExitIds.includes(toMoveId)) return;

    setExitActionError('');
    setRemovingExitIds((prev) => [...prev, toMoveId]);

    const success = await deleteTransition(move.id, toMoveId);
    if (!success) {
      setExitActionError('Could not remove exit. Please try again.');
    }

    setRemovingExitIds((prev) => prev.filter((item) => item !== toMoveId));
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Move"
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

      {activeTab === 'info' && !editing && (
        <div className={styles.statusRow}>
          <StatusPill status={move.status || ''} />
          <Button variant="subtle" size="sm" onClick={handleEditClick}>Edit details</Button>
        </div>
      )}

      {activeTab === 'info' && (editing ? (
        <>
          <Card className={styles.card}>
            <Field label="Status" htmlFor="edit-status" labelClassName={styles.sectionLabel}>
              <Select
                id="edit-status"
                name="edit-status"
                className={styles.select}
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="">no status</option>
                <option value="want to try">want to try</option>
                <option value="working on">working on</option>
                <option value="achieved">achieved</option>
              </Select>
            </Field>
          </Card>

          <Card className={styles.card}>
            <div className={styles.sectionLabel}>Alternate names</div>
            {editAliases.length > 0 && (
              <div className={styles.aliasTags}>
                {editAliases.map((alias, i) => (
                  <span key={i} className={styles.aliasTag}>
                    {alias}
                    <button className={styles.aliasRemove} onClick={() => handleRemoveAlias(i)} type="button">×</button>
                  </span>
                ))}
              </div>
            )}
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
              <Button variant="primary" size="sm" onClick={handleAddAlias} disabled={savingDetails}>Add</Button>
            </div>
            {aliasError && <p className={styles.aliasError}>{aliasError}</p>}
            {aliasConflict && (
              <div>
                <p className={styles.aliasWarning}>{aliasConflict.message}</p>
                <div className={styles.conflictButtons}>
                  <Button variant="primary" size="sm" onClick={() => addAlias(aliasConflict.titled)}>Add Anyway</Button>
                  <Button variant="subtle" size="sm" onClick={() => { setAliasConflict(null); setNewAlias(''); }}>Cancel</Button>
                </div>
              </div>
            )}
          </Card>

          <div className={styles.buttonRow}>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={savingDetails}>
              {savingDetails ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="subtle" size="sm" onClick={handleCancel} disabled={savingDetails}>Cancel</Button>
          </div>
          {saveError && <p className={styles.actionError}>{saveError}</p>}
        </>
      ) : (
        <>
          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.sectionLabel}>Note</span>
              <Button variant="subtle" size="sm" onClick={handleEditNote}>Edit</Button>
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
            ) : move.note ? (
              <div className={styles.noteEntry}>
                <div className={styles.notesText}>{move.note}</div>
                <Button variant="ghost" size="sm" className={styles.noteEditButton} onClick={handleEditNote}>Edit note</Button>
              </div>
            ) : (
              <Button variant="subtle" size="sm" leftIcon={<Plus size={16} />} onClick={handleEditNote}>
                Add note
              </Button>
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
      ))}

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
                    onClick={() => navigate(`/combos/${combo.id}`)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyHeading}>No combos yet</p>
              <p className={styles.emptyBody}>This move has not been added to any combos yet.</p>
            </div>
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
        <div className={styles.exitPickerContent}>
          <MoveListControls
            idPrefix="move-exit-picker"
            searchValue={exitSearchQuery}
            onSearchChange={setExitSearchQuery}
            onSearchClear={() => setExitSearchQuery('')}
            statusFilter={exitStatusFilter}
            onStatusFilterChange={setExitStatusFilter}
            sortBy={exitSortBy}
            onSortByChange={setExitSortBy}
            searchPlaceholder="Search moves..."
          />

          <div className={styles.exitPickerList}>
            {exitCandidates.map((candidate, index) => (
              <div key={candidate.id}>
                <MoveSelectRow
                  label={candidate.name}
                  selected={pendingExitIds.includes(candidate.id)}
                  onClick={() => togglePendingExit(candidate.id)}
                />
                {index < exitCandidates.length - 1 && <div className={styles.exitPickerDivider} />}
              </div>
            ))}
            {exitCandidates.length === 0 && (
              <p className={styles.emptyStateText}>No available moves to add.</p>
            )}
          </div>
        </div>
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
