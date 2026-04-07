import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Layers, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import {
  Card,
  Button,
  SectionLabel,
  IconButton,
  ConfirmDialog,
  PageHeader,
  StatusPill,
} from '../components/ui';
import styles from './SessionDetail.module.css';

function formatDate(isoString) {
  const [year, month, day] = isoString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessions, moves, loading, updateSession, deleteSession } = useApp();

  const session = sessions.find((s) => String(s.id) === id);
  const moveMap = useMemo(
    () => Object.fromEntries(moves.map((m) => [m.id, m])),
    [moves]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleEditEnter() {
    setNotes(session?.notes ?? '');
    setIsEditing(true);
  }

  function handleEditCancel() {
    setIsEditing(false);
  }

  async function handleSave() {
    if (!session) return;
    setSaving(true);
    await updateSession(session.id, { notes });
    setSaving(false);
    setIsEditing(false);
  }

  async function handleDeleteConfirm() {
    if (!session) return;
    setDeleting(true);
    await deleteSession(session.id);
    setDeleting(false);
    navigate('/you');
  }

  if (loading) return <p className={styles.stateText}>Loading...</p>;
  if (!session) return <p className={styles.stateText}>Session not found.</p>;

  const entries = session.entries || [];

  return (
    <div className={styles.page}>
      <PageHeader
        title="Session summary"
        leftAction={
          <IconButton
            icon={<ChevronLeft size={18} />}
            variant="ghost"
            label="Back"
            onClick={isEditing ? handleEditCancel : () => navigate('/you')}
          />
        }
        rightAction={
          isEditing ? (
            <IconButton
              icon={<Trash2 size={18} />}
              variant="ghost"
              label="Delete session"
              onClick={() => setIsDeleteDialogOpen(true)}
              className={styles.deleteIcon}
            />
          ) : (
            <IconButton
              icon={<Pencil size={18} />}
              variant="ghost"
              label="Edit session"
              onClick={handleEditEnter}
            />
          )
        }
        bleed
        noBorder
      />

      <h2 className={styles.sessionDate}>{formatDate(session.date)}</h2>

      <div className={styles.moveCount}>
        <Layers size={16} />
        <span>{entries.length} {entries.length === 1 ? 'move' : 'moves'}</span>
      </div>

      {(session.notes?.trim() || isEditing) && (
        <div className={styles.section}>
          <SectionLabel>Notes</SectionLabel>
          {isEditing ? (
            <textarea
              id="session-notes"
              name="session-notes"
              className={styles.notesTextarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this session…"
              rows={4}
            />
          ) : (
            <Card>
              <p className={styles.notesText}>{session.notes}</p>
            </Card>
          )}
        </div>
      )}

      <div className={styles.section}>
        <SectionLabel>Moves</SectionLabel>
        {entries.length === 0 ? (
          <Card>
            <p className={styles.emptyText}>No moves logged.</p>
          </Card>
        ) : (
          <div className={styles.moveList}>
            {entries.map((entry) => {
              const move = moveMap[entry.move_id];
              const status = entry.new_status || move?.status;
              return (
                <Card key={entry.move_id} className={styles.moveCard}>
                  <span className={styles.moveName}>
                    {move?.name ?? 'Unknown move'}
                  </span>
                  {status && <StatusPill status={status} />}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {isEditing && (
        <Button
          variant="primary"
          fullWidth
          onClick={handleSave}
          disabled={saving}
          className={styles.saveButton}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete session?"
        message={`This will permanently remove your session from ${formatDate(session.date)}.`}
        confirmLabel="Delete session"
        cancelLabel="Keep session"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        testIdPrefix="delete-session-dialog"
      />
    </div>
  );
}
