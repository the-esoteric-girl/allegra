import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import styles from './MoveDetail.module.css';

const STATUS_DOT_COLORS = {
  'achieved': 'var(--color-green)',
  'working on': 'var(--color-blue)',
  'want to try': 'var(--color-pink)',
};


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
      <button className={styles.backButton} onClick={() => navigate('/')}>
        ← Back
      </button>

      <div className={styles.moveName}>{move.name}</div>

      {move.aliases && move.aliases.length > 0 && (
        <div className={styles.aliases}>
          aka {move.aliases.join(', ')}
        </div>
      )}

      {!editing && (
        <div className={styles.statusRow}>
          <div
            className={styles.statusDot}
            style={{ backgroundColor: STATUS_DOT_COLORS[move.status] || 'var(--color-text-muted)' }}
          />
          <span className={styles.statusText}>{move.status}</span>
        </div>
      )}

      {editing ? (
        <>
          <div className={styles.card}>
            <div className={styles.sectionLabel}>Status</div>
            <select
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
                className={styles.addAliasInput}
                value={newAlias}
                onChange={(e) => { setNewAlias(e.target.value); setAliasError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAlias()}
                placeholder="Add alias"
              />
              <button className={styles.addAliasButton} onClick={handleAddAlias}>Add</button>
            </div>
            {aliasError && <p className={styles.aliasError}>{aliasError}</p>}
            {aliasConflict && (
              <div>
                <p className={styles.aliasWarning}>{aliasConflict.message}</p>
                <div className={styles.conflictButtons}>
                  <button className={styles.saveButton} onClick={() => addAlias(aliasConflict.titled)}>Add Anyway</button>
                  <button className={styles.cancelButton} onClick={() => { setAliasConflict(null); setNewAlias(''); }}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.buttonRow}>
            <button className={styles.saveButton} onClick={handleSave}>Save</button>
            <button className={styles.cancelButton} onClick={handleCancel}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.sectionLabel}>Note</span>
              <button className={styles.editButton} onClick={handleEditClick}>Edit</button>
            </div>
            {editingNote ? (
              <div className={styles.addNoteForm}>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Add a technique tip..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  autoFocus
                />
                <div className={styles.addNoteButtons}>
                  <button className={styles.saveButton} onClick={handleSaveNote}>Save</button>
                  <button className={styles.cancelButton} onClick={() => setEditingNote(false)}>Cancel</button>
                </div>
              </div>
            ) : move.note ? (
              <div className={styles.noteEntry}>
                <div className={styles.notesText}>{move.note}</div>
                <button className={styles.noteDeleteButton} onClick={handleEditNote}>Edit note</button>
              </div>
            ) : (
              <button className={styles.addNoteButton} onClick={handleEditNote}>
                + Add note
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
