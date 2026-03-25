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

  if (loading) return <p>Loading...</p>;

  const move = moves.find((m) => String(m.id) === id);

  if (!move) return <p>Move not found</p>;

  function handleEditClick() {
    setEditNotes(move.notes || '');
    setEditStatus(move.status);
    setEditing(true);
  }

  async function handleSave() {
    await updateMove(move.id, { notes: editNotes, status: editStatus });
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
            <strong>Notes:</strong>
            <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
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
