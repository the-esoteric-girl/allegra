import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { Button, StatusPill } from '../components/ui';
import styles from './MoveDetail.module.css';

export default function MoveDetail() {
  const { id } = useParams();
  const { moves, loading, updateMove } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editAliases, setEditAliases] = useState([]);
  const [newAlias, setNewAlias] = useState('');
  const [aliasError, setAliasError] = useState('');
  const [aliasConflict, setAliasConflict] = useState(null);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }

  if (loading) return <p>Loading...</p>;

  const move = moves.find((m) => String(m.id) === id);

  if (!move) return <p>Move not found</p>;

  function handleEditClick() {
    setEditStatus(move.status);
    setEditAliases(move.aliases ? [...move.aliases] : []);
    setNewAlias('');
    setAliasError('');
    setAliasConflict(null);
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
    await updateMove(move.id, { status: editStatus, aliases: editAliases });
    setEditing(false);
  }

  function handleCancel() {
    setEditing(false);
  }

  function handleEditNote() {
    setNoteText(move.note || '');
    setEditingNote(true);
  }

  async function handleSaveNote() {
    await updateMove(move.id, { note: noteText.trim() || null });
    setEditingNote(false);
  }

  return (
    <div className={styles.page}>
      <Button variant="ghost" size="sm" className={styles.backButton} onClick={() => navigate('/')}>
        ← Back
      </Button>

      <div className={styles.moveName}>{move.name}</div>

      {move.aliases && move.aliases.length > 0 && (
        <div className={styles.aliases}>
          aka {move.aliases.join(', ')}
        </div>
      )}

      {!editing && (
        <div className={styles.statusRow}>
          <StatusPill status={move.status} />
        </div>
      )}

      {editing ? (
        <>
          <div className={styles.card}>
            <div className={styles.sectionLabel}>Status</div>
            <select
              id="edit-status"
              name="edit-status"
              className={styles.select}
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              <option value="want to try">want to try</option>
              <option value="working on">working on</option>
              <option value="achieved">achieved</option>
            </select>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionLabel}>Alternate names</div>
            {editAliases.length > 0 && (
              <div className={styles.aliasTags}>
                {editAliases.map((alias, i) => (
                  <span key={i} className={styles.aliasTag}>
                    {alias}
                    <button className={styles.aliasRemove} onClick={() => handleRemoveAlias(i)}>×</button>
                  </span>
                ))}
              </div>
            )}
            <div className={styles.addAliasRow}>
              <input
                id="add-alias"
                name="add-alias"
                className={styles.addAliasInput}
                value={newAlias}
                onChange={(e) => { setNewAlias(e.target.value); setAliasError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAlias()}
                placeholder="Add alias"
              />
              <Button variant="primary" size="sm" onClick={handleAddAlias}>Add</Button>
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
            <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
            <Button variant="subtle" size="sm" onClick={handleCancel}>Cancel</Button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.sectionLabel}>Note</span>
              <Button variant="subtle" size="sm" onClick={handleEditClick}>Edit</Button>
            </div>
            {editingNote ? (
              <div className={styles.addNoteForm}>
                <textarea
                  id="note-text"
                  name="note-text"
                  className={styles.textarea}
                  rows={3}
                  placeholder="Add a technique tip..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  autoFocus
                />
                <div className={styles.addNoteButtons}>
                  <Button variant="primary" size="sm" onClick={handleSaveNote}>Save</Button>
                  <Button variant="subtle" size="sm" onClick={() => setEditingNote(false)}>Cancel</Button>
                </div>
              </div>
            ) : move.note ? (
              <div className={styles.noteEntry}>
                <div className={styles.notesText}>{move.note}</div>
                <Button variant="ghost" size="sm" className={styles.noteEditButton} onClick={handleEditNote}>Edit note</Button>
              </div>
            ) : (
              <Button variant="subtle" size="sm" onClick={handleEditNote}>+ Add note</Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
