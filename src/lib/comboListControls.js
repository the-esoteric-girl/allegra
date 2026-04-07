function normalizeName(value) {
  return (value || '').toString();
}

function moveCount(combo) {
  return combo.move_ids?.length ?? 0;
}

export function sortCombos(combos, sortBy = 'created-desc') {
  return [...combos].sort((a, b) => {
    switch (sortBy) {
      case 'created-asc':
        return a.created_at < b.created_at ? -1 : 1;
      case 'name-asc':
        return normalizeName(a.name).localeCompare(normalizeName(b.name));
      case 'name-desc':
        return normalizeName(b.name).localeCompare(normalizeName(a.name));
      case 'moves-desc':
        return moveCount(b) - moveCount(a);
      case 'moves-asc':
        return moveCount(a) - moveCount(b);
      case 'created-desc':
      default:
        return a.created_at > b.created_at ? -1 : 1;
    }
  });
}

