import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, Layers, Pencil, ChevronLeft } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { Card, Button, SectionLabel, IconButton, ConfirmDialog, PageHeader } from '../components/ui';
import styles from './ComboDetail.module.css';

export default function ComboDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { combos, moves, loading, deleteCombo } = useApp();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const combo = combos.find((item) => String(item.id) === id);
  const moveMap = useMemo(() => Object.fromEntries(moves.map((move) => [move.id, move])), [moves]);
  const sequence = combo?.move_ids || [];

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
            label="Back to combos"
            onClick={() => navigate('/combos')}
          />
        )}
        rightAction={(
          <IconButton
            icon={<Pencil size={18} />}
            variant="ghost"
            label="Edit combo"
            onClick={() => navigate(`/combos/${combo.id}/edit`)}
          />
        )}
        bleed
        noBorder
      />

      <h2 className={styles.comboName}>{combo.name || 'Untitled combo'}</h2>

      <div className={styles.moveCount}>
        <Layers size={16} />
        <span>{sequence.length} move{sequence.length !== 1 ? 's' : ''}</span>
      </div>

      <SectionLabel>Sequence</SectionLabel>
      {sequence.length === 0 ? (
        <Card>
          <p className={styles.emptyText}>No moves yet.</p>
        </Card>
      ) : (
        <div className={styles.sequenceList}>
          {sequence.map((moveId, index) => (
            <div key={`${moveId}-${index}`}>
              <Card className={styles.sequenceCard}>
                <span className={styles.sequenceNumber}>{index + 1}.</span>
                <span className={styles.sequenceName}>{moveMap[moveId]?.name || 'Unknown move'}</span>
              </Card>
              {index < sequence.length - 1 && (
                <div className={styles.connector}>
                  <ArrowDown size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {combo.notes?.trim() && (
        <div className={styles.notesSection}>
          <SectionLabel>Notes</SectionLabel>
          <Card>
            <p className={styles.notesText}>{combo.notes}</p>
          </Card>
        </div>
      )}

      <Button
        variant="ghost"
        className={styles.deleteButton}
        onClick={() => setIsDeleteDialogOpen(true)}
        data-testid="delete-combo-trigger"
      >
        Delete combo
      </Button>

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
