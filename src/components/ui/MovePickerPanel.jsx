import MoveListControls from './MoveListControls';
import MoveSelectRow from './MoveSelectRow';
import Pill from './Pill';
import Select from './Select';
import { cn } from '../../lib/cn';
import styles from './MovePickerPanel.module.css';

export default function MovePickerPanel({
  idPrefix,
  searchValue,
  onSearchChange,
  onSearchClear,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  searchPlaceholder = 'Search moves...',
  searchInputRef,
  controlsClassName,
  searchClassName,
  searchInputClassName,
  scopeValue,
  onScopeChange,
  scopeOptions,
  scopeClassName,
  items,
  onToggleItem,
  rowClassName,
  checkboxClassName,
  labelClassName,
  listClassName,
  dividerClassName,
  emptyState,
  className,
}) {
  return (
    <div className={cn(styles.root, className)}>
      <MoveListControls
        idPrefix={idPrefix}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onSearchClear={onSearchClear}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        scopeOptions={scopeOptions}
        scopeValue={scopeValue}
        onScopeChange={onScopeChange}
        searchPlaceholder={searchPlaceholder}
        searchInputRef={searchInputRef}
        className={cn(styles.controls, controlsClassName)}
        searchClassName={searchClassName}
        searchInputClassName={searchInputClassName}
        scopeClassName={scopeClassName}
      />

      {sortBy && onSortByChange && (
        <div className={styles.sortRow}>
          <Select
            id={`${idPrefix}-sort`}
            name={`${idPrefix}-sort`}
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            options={[
              { value: 'alpha-asc', label: 'A→Z' },
              { value: 'alpha-desc', label: 'Z→A' },
              { value: 'status', label: 'Status' },
            ]}
            className={styles.sortSelect}
          />
        </div>
      )}

      <div className={cn(styles.list, listClassName)}>
        {items.length === 0 && emptyState}
        {items.map((item, index) => (
          <div key={item.id}>
            <MoveSelectRow
              label={item.label}
              selected={item.selected}
              disabled={item.disabled}
              onClick={() => onToggleItem(item)}
              className={rowClassName}
              checkboxClassName={checkboxClassName}
              labelClassName={labelClassName}
            />
            {index < items.length - 1 && <div className={cn(styles.divider, dividerClassName)} />}
          </div>
        ))}
      </div>
    </div>
  );
}

