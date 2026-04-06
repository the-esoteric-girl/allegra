import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, Layers, Pencil, ChevronLeft } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { Card, Button, SectionLabel, IconButton } from '../components/ui';
import styles from './ComboDetail.module.css';

export default function ComboDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { combos, moves, loading, deleteCombo } = useApp();

  const combo = combos.find((item) => String(item.id) === id);
  const moveMap = useMemo(() => Object.fromEntries(moves.map((move) => [move.id, move])), [moves]);
  const sequence = combo?.move_ids || [];

  async function handleDelete() {
    if (!combo) return;
    const { error } = await deleteCombo(combo.id);
    if (!error) navigate('/combos');
  }

  if (loading) return <p className={styles.stateText}>Loading...</p>;
  if (!combo) return <p className={styles.stateText}>Combo not found.</p>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          className={styles.backButton}
          leftIcon={<ChevronLeft size={16} />}
          onClick={() => navigate('/combos')}
        >
          Back
        </Button>
        <h1 className={styles.headerTitle}>Combo</h1>
        <div className={styles.rightSlot}>
          <IconButton
            icon={<Pencil size={18} />}
            variant="ghost"
            label="Edit combo"
            onClick={() => navigate(`/combos/${combo.id}/edit`)}
          />
        </div>
      </div>

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

      <Button variant="ghost" className={styles.deleteButton} onClick={handleDelete}>
        Delete combo
      </Button>
    </div>
  );
}
