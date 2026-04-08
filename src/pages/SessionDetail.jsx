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
  DetailPageShell,
  StatusPill,
  StatusOptionButton,
  PageState,
} from '../components/ui';
import { MOVE_STATUS_VALUES, getStatusLabel } from '../lib/statusConfig';
import styles from './SessionDetail.module.css';

function formatDate(isoString) {
  const [year, month, day] = isoString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessions, moves, loading, updateSession, deleteSession, deleteSessionEntry, addSessionEntry } = useApp();

  const session = sessions.find((s) => String(s.id) === id);
  const moveMap = useMemo(
    () => Object.fromEntries(moves.map((m) => [m.id, m])),
    [moves]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [editedStatuses, setEditedStatuses] = useState({});
  const [statusPickerFor, setStatusPickerFor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleEditEnter() {
    setNotes(session?.notes ?? '');
    const initialStatuses = {};
    entries.forEach(entry => {
      initialStatuses[entry.move_id] = entry.new_status || moveMap[entry.move_id]?.status;
    });
    setEditedStatuses(initialStatuses);
    setIsEditing(true);
  }

  function handleEditCancel() {
    setIsEditing(false);
    setStatusPickerFor(null);
    setEditedStatuses({});
  }

  async function handleSave() {
    if (!session) return;
    setSaving(true);
    
    // Update session notes
    const result = await updateSession(session.id, { notes });
    
    // Handle status changes
    const statusChanges = entries.filter(entry => {
      const oldStatus = entry.new_status || moveMap[entry.move_id]?.status;
      const newStatus = editedStatuses[entry.move_id];
      return oldStatus !== newStatus;
    });
    
    for (const entry of statusChanges) {
      await deleteSessionEntry(session.id, entry.move_id);
      const previousStatus = entry.previous_status;
      const newStatus = editedStatuses[entry.move_id];
      await addSessionEntry(session.id, entry.move_id, previousStatus, newStatus, entry.notes_added);
    }
    
    setSaving(false);
    if (result.ok) {
      setIsEditing(false);
      setStatusPickerFor(null);
      setEditedStatuses({});
    }
  }

  async function handleDeleteConfirm() {
    if (!session) return;
    setDeleting(true);
    const result = await deleteSession(session.id);
    setDeleting(false);
    if (result.ok) navigate('/you');
  }

  if (loading) return <PageState text="Loading..." className={styles.stateText} />;
  if (!session) return <PageState text="Session not found." className={styles.stateText} />;

  const entries = session.entries || [];

  return (
    <DetailPageShell
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
      className={styles.page}
    >
      
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
            <div className={styles.notesCard}>
              <p className={styles.notesText}>{session.notes}</p>
            </div>
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
              const status = editedStatuses[entry.move_id] ?? entry.new_status ?? move?.status;
              return (
                <Card key={entry.move_id} className={styles.moveCard}>
                  <span className={styles.moveName}>
                    {move?.name ?? 'Unknown move'}
                  </span>
                  {isEditing ? (
                    <div className={styles.statusPickerWrap}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={styles.statusPillBtn}
                        onClick={() => setStatusPickerFor(
                          prev => prev === entry.move_id ? null : entry.move_id
                        )}
                      >
                        <StatusPill status={status} size="sm" />
                      </Button>
                      {statusPickerFor === entry.move_id && (
                        <div className={styles.pickerDropdown}>
                          {['', ...MOVE_STATUS_VALUES].map(s => (
                            <StatusOptionButton
                              key={s}
                              status={s}
                              label={getStatusLabel(s)}
                              selected={s === status}
                              variant="menu"
                              showCheck
                              onClick={() => {
                                setEditedStatuses(prev => ({
                                  ...prev,
                                  [entry.move_id]: s || null
                                }));
                                setStatusPickerFor(null);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    status && <StatusPill status={status} />
                  )}
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
    </DetailPageShell>
  );
}
