import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronLeft, Trash2, GripVertical, X, Search, ArrowDown } from 'lucide-react';
import { useApp } from '../context/useApp';
import { BottomSheet, IconButton, Button, Pill, Input, SectionLabel } from './ui';
import styles from './ComboModal.module.css';

function SortableCard({ id, name, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.sequenceCard}>
      <span className={styles.dragHandle} {...attributes} {...listeners}>
        <GripVertical size={18} />
      </span>
      <span className={styles.cardName}>{name}</span>
      <button type="button" className={styles.removeBtn} onClick={() => onRemove(id)} aria-label={`Remove ${name}`}>
        <X size={16} />
      </button>
    </div>
  );
}

export default function ComboModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { moves, createCombo } = useApp();

  const [view, setView] = useState('main');
  const [comboName, setComboName] = useState('');
  const [moveIds, setMoveIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSelected, setShowSelected] = useState(false);
  const [pendingIds, setPendingIds] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function resetAndClose() {
    setView('main');
    setComboName('');
    setMoveIds([]);
    setNotes('');
    setSearchQuery('');
    setShowSelected(false);
    setPendingIds([]);
    onClose();
  }

  function openAddMoves() {
    setPendingIds([...moveIds]);
    setSearchQuery('');
    setShowSelected(false);
    setView('addMoves');
  }

  function confirmAddMoves() {
    // Preserve existing order, append newly selected moves
    const existing = moveIds.filter(id => pendingIds.includes(id));
    const newOnes = pendingIds.filter(id => !moveIds.includes(id));
    setMoveIds([...existing, ...newOnes]);
    setView('main');
  }

  function togglePending(id) {
    setPendingIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  function removeFromSequence(id) {
    setMoveIds(prev => prev.filter(m => m !== id));
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMoveIds(prev => arrayMove(prev, prev.indexOf(active.id), prev.indexOf(over.id)));
    }
  }

  async function handleCreate() {
    await createCombo(comboName.trim(), moveIds, notes.trim());
    resetAndClose();
    navigate('/combos');
  }

  const moveMap = useMemo(() => Object.fromEntries(moves.map(m => [m.id, m])), [moves]);

  const filteredMoves = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return moves.filter(m => {
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.aliases || []).some(a => a.toLowerCase().includes(q));
      const matchesFilter = !showSelected || pendingIds.includes(m.id);
      return matchesSearch && matchesFilter;
    });
  }, [moves, searchQuery, showSelected, pendingIds]);

  const isAddPanel = view === 'addMoves';
  const newlySelectedCount = pendingIds.filter(id => !moveIds.includes(id)).length;
  const addBtnLabel = pendingIds.length === 0
    ? 'Add moves'
    : `Add ${pendingIds.length} move${pendingIds.length !== 1 ? 's' : ''}`;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={resetAndClose}
      title={isAddPanel ? 'Add moves' : 'New combo'}
      leftAction={
        <IconButton
          icon={<ChevronLeft size={20} />}
          label={isAddPanel ? 'Back' : 'Close'}
          onClick={isAddPanel ? () => setView('main') : resetAndClose}
        />
      }
      rightAction={
        !isAddPanel ? (
          <IconButton
            icon={<Trash2 size={18} />}
            label="Discard combo"
            onClick={resetAndClose}
          />
        ) : undefined
      }
    >
      <div className={styles.slidingWrapper}>
      <div className={styles.slidingTrack} data-panel={view}>
        {/* ── Main panel ── */}
        <div className={styles.panel}>
          <div className={styles.mainContent}>
            <div className={styles.nameSection}>
              <label className={styles.fieldLabel} htmlFor="combo-name">Name</label>
              <Input
                id="combo-name"
                name="combo-name"
                placeholder="Name (optional)"
                value={comboName}
                onChange={e => setComboName(e.target.value)}
              />
            </div>

            {moveIds.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyHeading}>Feeling your flow?</p>
                <p className={styles.emptyBody}>Add moves to create a new combo!</p>
                <Button leftIcon={<span>+</span>} onClick={openAddMoves}>
                  Add move
                </Button>
              </div>
            ) : (
              <>
                <div className={styles.statsRow}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Moves</span>
                    <span className={styles.statValue}>{moveIds.length}</span>
                  </div>
                </div>

                <SectionLabel>Sequence</SectionLabel>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={moveIds} strategy={verticalListSortingStrategy}>
                    <div className={styles.sequenceList}>
                      {moveIds.map((id, index) => (
                        <div key={id}>
                          <SortableCard
                            id={id}
                            name={moveMap[id]?.name ?? id}
                            onRemove={removeFromSequence}
                          />
                          {index < moveIds.length - 1 && (
                            <div className={styles.connector}>
                              <ArrowDown size={16} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <div className={styles.addMoreRow}>
                  <Button variant="ghost" leftIcon={<span>+</span>} onClick={openAddMoves}>
                    Add move
                  </Button>
                </div>

                <Input
                  id="combo-notes"
                  name="combo-notes"
                  placeholder="Any notes about this combo..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  multiline
                  rows={3}
                />
              </>
            )}
          </div>

          {moveIds.length > 0 && (
            <div className={styles.stickyFooter}>
              <Button fullWidth onClick={handleCreate}>
                Create combo
              </Button>
            </div>
          )}
        </div>

        {/* ── Add moves panel ── */}
        <div className={styles.panel}>
          <div className={styles.addContent}>
            <Input
              id="combo-search"
              name="combo-search"
              placeholder="Search moves..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              rightIcon={
                searchQuery ? (
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                ) : null
              }
            />

            <div className={styles.filterRow}>
              <Pill active={!showSelected} onClick={() => setShowSelected(false)}>
                All Statuses
              </Pill>
              <Pill active={showSelected} onClick={() => setShowSelected(true)}>
                Selected
              </Pill>
            </div>

            <div className={styles.moveList}>
              {filteredMoves.map((move, index) => {
                const selected = pendingIds.includes(move.id);
                return (
                  <div key={move.id}>
                    <button
                      type="button"
                      className={styles.moveRow}
                      onClick={() => togglePending(move.id)}
                    >
                      <span className={`${styles.checkbox} ${selected ? styles.checkboxSelected : ''}`} />
                      <span className={styles.moveName}>{move.name}</span>
                    </button>
                    {index < filteredMoves.length - 1 && <div className={styles.divider} />}
                  </div>
                );
              })}
              {filteredMoves.length === 0 && (
                <p className={styles.noResults}>No moves found</p>
              )}
            </div>
          </div>

          <div className={styles.stickyFooter}>
            <Button fullWidth onClick={confirmAddMoves} disabled={pendingIds.length === 0}>
              + {addBtnLabel}
            </Button>
          </div>
        </div>
      </div>
      </div>
    </BottomSheet>
  );
}
