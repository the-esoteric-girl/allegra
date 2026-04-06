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
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, ArrowDown } from 'lucide-react';
import { Button, Pill, Input, SectionLabel, SearchField, MoveSelectRow, Field } from './ui';
import styles from './ComboEditorPanels.module.css';

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
      <button
        type="button"
        className={styles.removeBtn}
        onClick={() => onRemove(id)}
        aria-label={`Remove ${name}`}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default function ComboEditorPanels({ editor, mode = 'create', showInlineAddButton = false }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const {
    view,
    comboName,
    setComboName,
    moveIds,
    notes,
    setNotes,
    openAddMoves,
    removeFromSequence,
    handleDragEnd,
    pendingIds,
    confirmAddMoves,
    searchQuery,
    setSearchQuery,
    showSelected,
    setShowSelected,
    filteredMoves,
    togglePending,
    moveMap,
  } = editor;

  const inEditMode = mode === 'edit';
  const emptyHeading = inEditMode ? 'Build your sequence' : 'Feeling your flow?';
  const emptyBody = inEditMode
    ? 'Add moves to start editing this combo.'
    : 'Add moves to create a new combo!';

  return (
    <div className={styles.slidingWrapper}>
      <div className={styles.slidingTrack} data-panel={view}>
        <div className={styles.panel}>
          <div className={styles.mainContent}>
            <div className={styles.nameSection}>
              <Field label="Name" htmlFor="combo-name">
                <Input
                  id="combo-name"
                  name="combo-name"
                  placeholder="Name (optional)"
                  value={comboName}
                  onChange={(e) => setComboName(e.target.value)}
                />
              </Field>
            </div>

            {moveIds.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyHeading}>{emptyHeading}</p>
                <p className={styles.emptyBody}>{emptyBody}</p>
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
                            name={moveMap[id]?.name ?? 'Unknown move'}
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

                <Field label="Notes" htmlFor="combo-notes">
                  <Input
                    id="combo-notes"
                    name="combo-notes"
                    placeholder="Any notes about this combo..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    rows={3}
                  />
                </Field>
              </>
            )}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.addContent}>
            <SearchField
              id="combo-search"
              name="combo-search"
              placeholder="Search moves..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
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
                    <MoveSelectRow
                      label={move.name}
                      selected={selected}
                      onClick={() => togglePending(move.id)}
                      className={styles.moveRow}
                      checkboxClassName={styles.checkbox}
                      labelClassName={styles.moveName}
                    />
                    {index < filteredMoves.length - 1 && <div className={styles.divider} />}
                  </div>
                );
              })}
              {filteredMoves.length === 0 && (
                <p className={styles.noResults}>No moves found</p>
              )}
            </div>

            {showInlineAddButton && (
              <Button
                fullWidth
                onClick={confirmAddMoves}
                disabled={pendingIds.length === 0}
                className={styles.mobileAddButton}
              >
                + Add {pendingIds.length} move{pendingIds.length !== 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
