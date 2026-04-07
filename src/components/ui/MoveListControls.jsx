import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SearchField from './SearchField';
import Pill from './Pill';
import Button from './Button';
import { MOVE_STATUS_FILTER_OPTIONS } from '../../lib/moveListControls';
import { cn } from '../../lib/cn';
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
  searchPlaceholder = 'Search moves',
  searchInputRef,
  className,
  searchClassName,
  searchInputClassName,
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

  const isAscending = sortBy !== 'alpha-desc';

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

      <div className={styles.row}>
        <div className={styles.statusWrap} ref={menuRef}>
          <Pill
            active={statusFilter !== 'any'}
            className={styles.statusPill}
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

        <Button
          type="button"
          variant="subtle"
          size="sm"
          className={styles.sortButton}
          onClick={() => onSortByChange(isAscending ? 'alpha-desc' : 'alpha-asc')}
        >
          {isAscending ? 'A→Z' : 'Z→A'}
        </Button>
      </div>
    </div>
  );
}
