import SearchField from './SearchField';
import Select from './Select';
import { MOVE_STATUS_FILTER_OPTIONS, getMoveSortOptions } from '../../lib/moveListControls';
import styles from './MoveListControls.module.css';

export default function MoveListControls({
  idPrefix = 'move-list',
  searchValue,
  onSearchChange,
  onSearchClear,
  statusFilter = 'any',
  onStatusFilterChange,
  sortBy = 'alpha-asc',
  onSortByChange,
  includeCreatedSort = true,
  searchPlaceholder = 'Search moves',
  searchInputRef,
  className,
  searchClassName,
  searchInputClassName,
}) {
  const sortOptions = getMoveSortOptions({ includeCreatedSort });

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      <SearchField
        id={`${idPrefix}-search`}
        name={`${idPrefix}-search`}
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={onSearchClear}
        inputRef={searchInputRef}
        className={[styles.search, searchClassName].filter(Boolean).join(' ')}
        inputClassName={searchInputClassName}
      />

      <div className={styles.row}>
        <Select
          id={`${idPrefix}-status-filter`}
          name={`${idPrefix}-status-filter`}
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className={styles.select}
          aria-label="Filter by status"
        >
          {MOVE_STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          id={`${idPrefix}-sort-by`}
          name={`${idPrefix}-sort-by`}
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className={styles.select}
          aria-label="Sort moves"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
