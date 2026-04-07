import { Search, X } from 'lucide-react';
import Input from './Input';
import styles from './SearchField.module.css';
import { cn } from '../../lib/cn';

export default function SearchField({
  id,
  name,
  value,
  onChange,
  onClear,
  placeholder = 'Search',
  inputRef,
  className,
  inputClassName,
  ...props
}) {
  return (
    <Input
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      inputRef={inputRef}
      className={className}
      inputClassName={cn(styles.input, inputClassName)}
      leftIcon={<Search size={16} />}
      rightIcon={
        value ? (
          <button
            type="button"
            className={styles.clear}
            onClick={onClear}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : null
      }
      {...props}
    />
  );
}
