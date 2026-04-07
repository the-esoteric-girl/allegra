import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, Layers, Pencil, ChevronLeft, Trash2 } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { Card, Button, SectionLabel, IconButton, ConfirmDialog, PageHeader } from '../components/ui';
import styles from './ComboDetail.module.css';

export default function ComboDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { combos, moves, loading, updateCombo, deleteCombo } = useApp();

  const combo = combos.find((item) => String(item.id) === id);
  const moveMap = useMemo(() => Object.fromEntries(moves.map((move) => [move.id, move])), [moves]);
  const sequence = combo?.move_ids || [];

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleEditEnter() {
    setName(combo?.name ?? '');
    setNotes(combo?.notes ?? '');
    setIsEditing(true);
  }

  function handleEditCancel() {
    setIsEditing(false);
  }

  async function handleSave() {
    if (!combo) return;
    setSaving(true);
    await updateCombo(combo.id, { name, notes });
    setSaving(false);
    setIsEditing(false);
  }

  async function handleDeleteConfirm() {
    if (!combo) return;
    setDeleting(true);
    const { error } = await deleteCombo(combo.id);
    setDeleting(false);
    if (!error) navigate('/combos');
  }

  if (loading) return <p className={styles.stateText}>Loading...</p>;
  if (!combo) return <p className={styles.stateText}>Combo not found.</p>;

  return (
    <div className={styles.page}>
      <PageHeader
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
        bleed
        noBorder
      />

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
            {sequence.map((moveId, index) => (
              <div key={`${moveId}-${index}`}>
                <div className={styles.sequenceRow}>
                  <span className={styles.sequenceNumber}>{index + 1}</span>
                  <Card className={styles.sequenceCard}>
                    <span className={styles.sequenceName}>{moveMap[moveId]?.name || 'Unknown move'}</span>
                  </Card>
                </div>
                {index < sequence.length - 1 && (
                  <div className={styles.connector}>
                    <ArrowDown size={16} />
                  </div>
                )}
              </div>
            ))}
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
            <Card>
              <p className={styles.notesText}>{combo.notes}</p>
            </Card>
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
    </div>
  );
}
