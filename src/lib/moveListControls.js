export const MOVE_STATUS_FILTER_OPTIONS = [
  { value: 'any', label: 'Any status' },
  { value: 'none', label: 'No status' },
  { value: 'want to try', label: 'Want to try' },
  { value: 'working on', label: 'Working on' },
  { value: 'achieved', label: 'Achieved' },
];

export function getMoveSortOptions({ includeCreatedSort = true } = {}) {
  const options = [
    { value: 'alpha-asc', label: 'A to Z' },
    { value: 'alpha-desc', label: 'Z to A' },
    { value: 'status', label: 'Status' },
  ];

  if (includeCreatedSort) {
    options.push(
      { value: 'created-desc', label: 'Newest created' },
      { value: 'created-asc', label: 'Oldest created' }
    );
  }

  return options;
}

function normalizeText(value) {
  return (value || '').toString().trim().toLowerCase();
}

function normalizeStatus(status) {
  return normalizeText(status);
}

function getCreatedTimestamp(move) {
  if (!move?.created_at) return 0;
  const ts = Date.parse(move.created_at);
  return Number.isNaN(ts) ? 0 : ts;
}

function getStatusRank(status) {
  const normalized = normalizeStatus(status);
  if (normalized === 'achieved') return 0;
  if (normalized === 'working on') return 1;
  if (normalized === 'want to try') return 2;
  return 3;
}

export function filterMovesBySearchAndStatus(moves, { searchQuery = '', statusFilter = 'any' } = {}) {
  const normalizedQuery = normalizeText(searchQuery);
  const normalizedStatusFilter = normalizeText(statusFilter || 'any');

  return moves.filter((move) => {
    const moveName = normalizeText(move.name);
    const moveAliases = Array.isArray(move.aliases) ? move.aliases : [];
    const matchesSearch =
      !normalizedQuery ||
      moveName.includes(normalizedQuery) ||
      moveAliases.some((alias) => normalizeText(alias).includes(normalizedQuery));

    const moveStatus = normalizeStatus(move.status);
    const matchesStatus =
      normalizedStatusFilter === 'any' ||
      (normalizedStatusFilter === 'none' ? !moveStatus : moveStatus === normalizedStatusFilter);

    return matchesSearch && matchesStatus;
  });
}

export function sortMoves(moves, sortBy = 'alpha-asc') {
  const list = [...moves];

  list.sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    const alphabeticalAsc = nameA.localeCompare(nameB);

    switch (sortBy) {
      case 'alpha-desc':
        return -alphabeticalAsc;
      case 'created-desc': {
        const diff = getCreatedTimestamp(b) - getCreatedTimestamp(a);
        return diff || alphabeticalAsc;
      }
      case 'created-asc': {
        const diff = getCreatedTimestamp(a) - getCreatedTimestamp(b);
        return diff || alphabeticalAsc;
      }
      case 'status': {
        const rankDiff = getStatusRank(a.status) - getStatusRank(b.status);
        return rankDiff || alphabeticalAsc;
      }
      case 'alpha-asc':
      default:
        return alphabeticalAsc;
    }
  });

  return list;
}
