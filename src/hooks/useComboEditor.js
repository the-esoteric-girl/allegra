import { useMemo, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { filterMovesBySearchAndStatus, sortMoves } from '../lib/moveListControls';

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
  const [statusFilter, setStatusFilter] = useState('any');
  const [sortBy, setSortBy] = useState('alpha-asc');
  const [pendingIds, setPendingIds] = useState([]);

  const moveMap = useMemo(() => Object.fromEntries(moves.map((m) => [m.id, m])), [moves]);

  const filteredMoves = useMemo(() => {
    const scopedMoves = showSelected
      ? moves.filter((move) => pendingIds.includes(move.id))
      : moves;

    const filtered = filterMovesBySearchAndStatus(scopedMoves, {
      searchQuery,
      statusFilter,
    });

    return sortMoves(filtered, sortBy);
  }, [moves, searchQuery, showSelected, pendingIds, statusFilter, sortBy]);

  function openAddMoves() {
    setPendingIds([...moveIds]);
    setSearchQuery('');
    setShowSelected(false);
    setStatusFilter('any');
    setSortBy('alpha-asc');
    setView('addMoves');
  }

  function closeAddMoves() {
    setView('main');
    setSearchQuery('');
    setShowSelected(false);
    setStatusFilter('any');
    setSortBy('alpha-asc');
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
    setStatusFilter('any');
    setSortBy('alpha-asc');
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
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
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
