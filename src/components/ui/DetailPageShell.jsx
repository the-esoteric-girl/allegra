import PageHeader from './PageHeader';
import { cn } from '../../lib/cn';
import styles from './DetailPageShell.module.css';

export default function DetailPageShell({
  title,
  leftAction,
  rightAction,
  headerClassName,
  children,
  className,
}) {
  return (
    <div className={cn(styles.page, className)}>
      <PageHeader
        title={title}
        leftAction={leftAction}
        rightAction={rightAction}
        bleed
        noBorder
        className={cn(styles.header, headerClassName)}
      />
      {children}
    </div>
  );
}

