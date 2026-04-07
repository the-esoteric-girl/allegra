export const MOVE_STATUS_VALUES = ['want to try', 'working on', 'achieved'];

export const STATUS_LABELS = {
  '': 'No status',
  'want to try': 'Want to try',
  'working on': 'Working on',
  achieved: 'Achieved',
};

export const MOVE_STATUS_FILTER_OPTIONS = [
  { value: 'any', label: 'Any status' },
  { value: 'none', label: 'No status' },
  ...MOVE_STATUS_VALUES.map((value) => ({
    value,
    label: STATUS_LABELS[value],
  })),
];

export function getStatusLabel(status) {
  const key = status ?? '';
  return STATUS_LABELS[key] ?? STATUS_LABELS[''];
}

