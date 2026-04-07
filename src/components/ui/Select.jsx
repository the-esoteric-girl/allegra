import styles from './Select.module.css';
import { cn } from '../../lib/cn';

export default function Select({ id, name, value, onChange, className, children, ...props }) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      {...props}
      className={cn(styles.select, className)}
    >
      {children}
    </select>
  );
}
