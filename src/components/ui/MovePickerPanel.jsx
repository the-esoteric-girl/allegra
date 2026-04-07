import MoveListControls from './MoveListControls';
import MoveSelectRow from './MoveSelectRow';
import Pill from './Pill';
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
        sortBy={sortBy}
        onSortByChange={onSortByChange}
        searchPlaceholder={searchPlaceholder}
        searchInputRef={searchInputRef}
        className={cn(styles.controls, controlsClassName)}
        searchClassName={searchClassName}
        searchInputClassName={searchInputClassName}
      />

      {Array.isArray(scopeOptions) && scopeOptions.length > 0 && onScopeChange ? (
        <div className={cn(styles.scopeRow, scopeClassName)}>
          {scopeOptions.map((option) => (
            <Pill
              key={option.value}
              active={scopeValue === option.value}
              onClick={() => onScopeChange(option.value)}
            >
              {option.label}
            </Pill>
          ))}
        </div>
      ) : null}

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

