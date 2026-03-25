import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function MoveDetail() {
  const { id } = useParams();
  const { moves, loading, updateMove } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editAliases, setEditAliases] = useState([]);
  const [newAlias, setNewAlias] = useState('');
  const [aliasError, setAliasError] = useState('');
  const [aliasConflict, setAliasConflict] = useState(null);

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }

  if (loading) return <p>Loading...</p>;

  const move = moves.find((m) => String(m.id) === id);

  if (!move) return <p>Move not found</p>;

  function handleEditClick() {
    setEditNotes(move.notes || '');
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
    await updateMove(move.id, { notes: editNotes, status: editStatus, aliases: editAliases });
    setEditing(false);
  }

  function handleCancel() {
    setEditing(false);
  }

  return (
    <div>
      <button onClick={() => navigate('/')}>Back</button>
      <h1>{move.name}</h1>
      <p>
        <strong>Alternate names:</strong>{' '}
        {move.aliases && move.aliases.length > 0
          ? move.aliases.join(', ')
          : 'No alternate names'}
      </p>
      {editing ? (
        <>
          <div>
            <strong>Status:</strong>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
              <option value="want to try">want to try</option>
              <option value="working on">working on</option>
              <option value="achieved">achieved</option>
            </select>
          </div>
          <div>
            <strong>Alternate names:</strong>
            <div>
              {editAliases.map((alias, i) => (
                <span key={i}>
                  {alias}{' '}
                  <button onClick={() => handleRemoveAlias(i)}>x</button>{' '}
                </span>
              ))}
            </div>
            <input
              value={newAlias}
              onChange={(e) => { setNewAlias(e.target.value); setAliasError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddAlias()}
              placeholder="Add alias"
            />
            <button onClick={handleAddAlias}>Add</button>
            {aliasError && <p style={{color: 'red'}}>{aliasError}</p>}
            {aliasConflict && (
              <div>
                <p style={{color: 'orange'}}>{aliasConflict.message}</p>
                <button onClick={() => addAlias(aliasConflict.titled)}>Add Anyway</button>
                <button onClick={() => { setAliasConflict(null); setNewAlias(''); }}>Cancel</button>
              </div>
            )}
          </div>
          <div>
            <strong>Notes:</strong>
            <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={6} style={{width: '100%'}} />
          </div>
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </>
      ) : (
        <>
          <p>
            <strong>Status:</strong> {move.status}
          </p>
          <p>
            <strong>Notes:</strong> {move.notes || 'No notes yet'}
          </p>
          <button onClick={handleEditClick}>Edit</button>
        </>
      )}
    </div>
  );
}
