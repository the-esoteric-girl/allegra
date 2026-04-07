import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { Button, StatusPill, ConfirmDialog, Select, Input, Field, IconButton, PageHeader } from '../components/ui';
import styles from './MoveDetail.module.css';

export default function MoveDetail() {
  const { id } = useParams();
  const { moves, combos, loading, updateMove, deleteMove } = useApp();
  const navigate = useNavigate();
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }

  if (loading) return <p>Loading...</p>;

  const move = moves.find((m) => String(m.id) === id);

  if (!move) return <p>Move not found</p>;

  const relatedCombos = combos.filter(c => c.move_ids?.includes(move.id));

  function handleEditClick() {
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

      {!editing && (
        <div className={styles.statusRow}>
          <StatusPill status={move.status || ''} />
          <Button variant="subtle" size="sm" onClick={handleEditClick}>Edit details</Button>
        </div>
      )}

      {editing ? (
        <>
          <div className={styles.card}>
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
          </div>

          <div className={styles.card}>
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
          </div>

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
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.sectionLabel}>Note</span>
              <Button variant="subtle" size="sm" onClick={handleEditNote}>Edit</Button>
            </div>
            {editingNote ? (
              <div className={styles.addNoteForm}>
                <Input
                  id="note-text"
                  name="note-text"
                  inputClassName={styles.textarea}
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
          </div>

          {relatedCombos.length > 0 && (
            <div className={styles.card}>
              <div className={styles.sectionLabel}>Appears in</div>
              {relatedCombos.map(combo => (
                <button
                  key={combo.id}
                  type="button"
                  className={styles.comboLink}
                  onClick={() => navigate(`/combos/${combo.id}`)}
                >
                  <span className={styles.comboLinkName}>{combo.name || 'Untitled combo'}</span>
                  <span className={styles.comboLinkMeta}>{combo.move_ids.length} move{combo.move_ids.length !== 1 ? 's' : ''}</span>
                </button>
              ))}
            </div>
          )}

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
