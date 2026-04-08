import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, Layers, Pencil, ChevronLeft, Trash2 } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { Button, StatusPill, StatusOptionButton, Card, SectionLabel, IconButton, ConfirmDialog, DetailPageShell, PageState } from '../components/ui';
import { MOVE_STATUS_VALUES, getStatusLabel } from '../lib/statusConfig';
import styles from './ComboDetail.module.css';

export default function ComboDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { combos, moves, loading, updateCombo, updateMove, deleteCombo } = useApp();

  const combo = combos.find((item) => String(item.id) === id);
  const moveMap = useMemo(() => Object.fromEntries(moves.map((move) => [move.id, move])), [moves]);
  const sequence = combo?.move_ids || [];

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [editedMoveStatuses, setEditedMoveStatuses] = useState({});
  const [statusPickerFor, setStatusPickerFor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleEditEnter() {
    setName(combo?.name ?? '');
    setNotes(combo?.notes ?? '');
    const initialStatuses = {};
    sequence.forEach(moveId => {
      initialStatuses[moveId] = moveMap[moveId]?.status;
    });
    setEditedMoveStatuses(initialStatuses);
    setIsEditing(true);
  }

  function handleEditCancel() {
    setIsEditing(false);
    setStatusPickerFor(null);
    setEditedMoveStatuses({});
  }

  async function handleSave() {
    if (!combo) return;
    setSaving(true);
    
    // Update combo name and notes
    const result = await updateCombo(combo.id, { name, notes });
    
    // Handle move status changes
    for (const moveId of sequence) {
      const oldStatus = moveMap[moveId]?.status;
      const newStatus = editedMoveStatuses[moveId];
      if (oldStatus !== newStatus) {
        await updateMove(moveId, { status: newStatus });
      }
    }
    
    setSaving(false);
    if (result.ok) {
      setIsEditing(false);
      setStatusPickerFor(null);
      setEditedMoveStatuses({});
    }
  }

  async function handleDeleteConfirm() {
    if (!combo) return;
    setDeleting(true);
    const result = await deleteCombo(combo.id);
    setDeleting(false);
    if (result.ok) navigate('/combos');
  }

  if (loading) return <PageState text="Loading..." className={styles.stateText} />;
  if (!combo) return <PageState text="Combo not found." className={styles.stateText} />;

  return (
    <DetailPageShell
      title="Combo"
      leftAction={(
        <IconButton
          icon={<ChevronLeft size={18} />}
          variant="ghost"
          label="Back"
          onClick={isEditing ? handleEditCancel : () => navigate(location.state?.backTo || '/combos')}
        />
      )}
      rightAction={(
        isEditing ? (
          <IconButton
            icon={<Trash2 size={18} />}
            variant="ghost"
            label="Delete combo"
            onClick={() => setIsDeleteDialogOpen(true)}
            className={styles.deleteIcon}
          />
        ) : (
          <IconButton
            icon={<Pencil size={18} />}
            variant="ghost"
            label="Edit combo"
            onClick={handleEditEnter}
          />
        )
      )}
      className={styles.page}
    >
      
      {isEditing ? (
        <input
          id="combo-name"
          name="combo-name"
          type="text"
          className={styles.nameInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Combo name"
        />
      ) : (
        <h2 className={styles.comboName}>{combo.name || 'Untitled combo'}</h2>
      )}

      <div className={styles.moveCount}>
        <Layers size={16} />
        <span>{sequence.length} move{sequence.length !== 1 ? 's' : ''}</span>
      </div>

      <div className={styles.section}>
        <SectionLabel>Sequence</SectionLabel>
        {sequence.length === 0 ? (
          <Card>
            <p className={styles.emptyText}>No moves yet.</p>
          </Card>
        ) : (
          <div className={styles.sequenceList}>
            {sequence.map((moveId, index) => {
              const move = moveMap[moveId];
              const status = editedMoveStatuses[moveId] ?? move?.status;
              return (
                <div key={`${moveId}-${index}`}>
                  <div className={styles.sequenceRow}>
                    <span className={styles.sequenceNumber}>{index + 1}</span>
                    <Card className={styles.sequenceCard}>
                      <span className={styles.sequenceName}>{move?.name || 'Unknown move'}</span>
                      {isEditing ? (
                        <div className={styles.statusPickerWrap}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={styles.statusPillBtn}
                            onClick={() => setStatusPickerFor(
                              prev => prev === moveId ? null : moveId
                            )}
                          >
                            <StatusPill status={status} size="sm" />
                          </Button>
                          {statusPickerFor === moveId && (
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
                                    setEditedMoveStatuses(prev => ({
                                      ...prev,
                                      [moveId]: s || null
                                    }));
                                    setStatusPickerFor(null);
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        status && <StatusPill status={status} size="sm" />
                      )}
                    </Card>
                  </div>
                  {index < sequence.length - 1 && (
                    <div className={styles.connector}>
                      <ArrowDown size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(combo.notes?.trim() || isEditing) && (
        <div className={styles.section}>
          <SectionLabel>Notes</SectionLabel>
          {isEditing ? (
            <textarea
              id="combo-notes"
              name="combo-notes"
              className={styles.notesTextarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this combo…"
              rows={4}
            />
          ) : (
            <div className={styles.notesCard}>
              <p className={styles.notesText}>{combo.notes}</p>
            </div>
          )}
        </div>
      )}

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
        title="Delete combo?"
        message={`"${combo.name || 'Untitled combo'}" will be removed permanently.`}
        confirmLabel="Delete combo"
        cancelLabel="Keep combo"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        testIdPrefix="delete-combo-dialog"
      />
    </DetailPageShell>
  );
}
