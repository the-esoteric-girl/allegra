import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SearchField from './SearchField';
import Select from './Select';
import Pill from './Pill';
import { cn } from '../../lib/cn';
import { getMoveSortOptions, MOVE_STATUS_FILTER_OPTIONS } from '../../lib/moveListControls';
import styles from './MoveListControls.module.css';

export default function MoveListControls({
  idPrefix = 'move-list',
  searchValue,
  onSearchChange,
  onSearchClear,
  statusFilter = 'any',
  onStatusFilterChange,
  scopeOptions = [],
  scopeValue,
  onScopeChange,
  sortBy = 'alpha-asc',
  onSortByChange,
  sortOptions = getMoveSortOptions(),
  searchPlaceholder = 'Search moves',
  searchInputRef,
  className,
  searchClassName,
  searchInputClassName,
  scopeClassName,
}) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isStatusOpen) return;

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsStatusOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isStatusOpen]);

  const activeStatusLabel =
    MOVE_STATUS_FILTER_OPTIONS.find((option) => option.value === statusFilter)?.label ?? 'Any status';

  const sortControl = onSortByChange ? (
    <Select
      id={`${idPrefix}-sort`}
      name={`${idPrefix}-sort`}
      value={sortBy}
      onChange={(e) => onSortByChange(e.target.value)}
      options={sortOptions}
      className={styles.sortSelect}
    />
  ) : null;

  return (
    <div className={cn(styles.wrapper, className)}>
      <SearchField
        id={`${idPrefix}-search`}
        name={`${idPrefix}-search`}
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={onSearchClear}
        inputRef={searchInputRef}
        className={cn(styles.search, searchClassName)}
        inputClassName={searchInputClassName}
      />

      <div className={styles.pillRow}>
        {Array.isArray(scopeOptions) && scopeOptions.length > 0 && (
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
        )}

        <div className={styles.actionsRow}>
          {sortControl}

          <div className={styles.statusWrap} ref={menuRef}>
            <Pill
              active={statusFilter !== 'any'}
              className={styles.statusFilterPill}
              onClick={() => setIsStatusOpen((open) => !open)}
            >
              <span className={styles.statusPillLabel}>{activeStatusLabel}</span>
              <ChevronDown size={14} className={cn(styles.statusChevron, isStatusOpen && styles.statusChevronOpen)} />
            </Pill>

            {isStatusOpen && (
              <div className={styles.statusMenu} role="listbox" aria-label="Status filters">
                {MOVE_STATUS_FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(styles.statusOption, option.value === statusFilter && styles.statusOptionActive)}
                    onClick={() => {
                      onStatusFilterChange(option.value);
                      setIsStatusOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
