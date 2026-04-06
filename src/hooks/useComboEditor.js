import { useMemo, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

function normalizeIds(ids) {
  return Array.isArray(ids) ? ids.filter(Boolean) : [];
}

export function useComboEditor(moves, initialDraft = {}) {
  const [view, setView] = useState('main');
  const [comboName, setComboName] = useState(initialDraft.name || '');
  const [moveIds, setMoveIds] = useState(normalizeIds(initialDraft.moveIds));
  const [notes, setNotes] = useState(initialDraft.notes || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSelected, setShowSelected] = useState(false);
  const [pendingIds, setPendingIds] = useState([]);

  const moveMap = useMemo(() => Object.fromEntries(moves.map((m) => [m.id, m])), [moves]);

  const filteredMoves = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return moves.filter((move) => {
      const matchesSearch =
        !q ||
        move.name.toLowerCase().includes(q) ||
        (move.aliases || []).some((alias) => alias.toLowerCase().includes(q));

      const matchesFilter = !showSelected || pendingIds.includes(move.id);

      return matchesSearch && matchesFilter;
    });
  }, [moves, searchQuery, showSelected, pendingIds]);

  function openAddMoves() {
    setPendingIds([...moveIds]);
    setSearchQuery('');
    setShowSelected(false);
    setView('addMoves');
  }

  function closeAddMoves() {
    setView('main');
    setSearchQuery('');
    setShowSelected(false);
    setPendingIds([]);
  }

  function confirmAddMoves() {
    const existing = moveIds.filter((id) => pendingIds.includes(id));
    const newlySelected = pendingIds.filter((id) => !moveIds.includes(id));
    setMoveIds([...existing, ...newlySelected]);
    setView('main');
  }

  function togglePending(id) {
    setPendingIds((prev) =>
      prev.includes(id) ? prev.filter((pendingId) => pendingId !== id) : [...prev, id]
    );
  }

  function removeFromSequence(id) {
    setMoveIds((prev) => prev.filter((moveId) => moveId !== id));
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setMoveIds((prev) =>
      arrayMove(prev, prev.indexOf(active.id), prev.indexOf(over.id))
    );
  }

  function setDraft({ name = '', moveIds: nextMoveIds = [], notes = '' }) {
    setComboName(name || '');
    setMoveIds(normalizeIds(nextMoveIds));
    setNotes(notes || '');
    setView('main');
    setSearchQuery('');
    setShowSelected(false);
    setPendingIds([]);
  }

  function resetToEmpty() {
    setDraft({ name: '', moveIds: [], notes: '' });
  }

  const isAddPanel = view === 'addMoves';

  return {
    view,
    isAddPanel,
    comboName,
    setComboName,
    moveIds,
    notes,
    setNotes,
    searchQuery,
    setSearchQuery,
    showSelected,
    setShowSelected,
    pendingIds,
    moveMap,
    filteredMoves,
    openAddMoves,
    closeAddMoves,
    confirmAddMoves,
    togglePending,
    removeFromSequence,
    handleDragEnd,
    setDraft,
    resetToEmpty,
  };
}
