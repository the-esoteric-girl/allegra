import { useEffect, useState } from 'react';
import styles from './BottomSheet.module.css';
import { cn } from '../../lib/cn';
import useModalBehavior from './useModalBehavior';

const SHEET_OPEN_MS = 420;
const SHEET_CLOSE_MS = 280;

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  leftAction,
  rightAction,
  bottomAction,
}) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);
  useModalBehavior({ isOpen: isRendered, onEscape: onClose });

  useEffect(() => {
    if (isOpen) {
      const openTimer = setTimeout(() => {
        setIsRendered(true);
        requestAnimationFrame(() => setIsVisible(true));
      }, 0);

      return () => clearTimeout(openTimer);
    }

    if (!isRendered) return;
    const closeFrame = requestAnimationFrame(() => {
      setIsVisible(false);
    });

    const timeout = setTimeout(() => {
      setIsRendered(false);
    }, SHEET_CLOSE_MS);

    return () => {
      cancelAnimationFrame(closeFrame);
      clearTimeout(timeout);
    };
  }, [isOpen, isRendered]);

  if (!isRendered) return null;

  return (
    <>
      <div
        className={cn(styles.overlay, !isVisible && styles.overlayHidden)}
        onClick={onClose}
      />
      <div
        className={cn(styles.sheet, !isVisible && styles.sheetHidden)}
        role="dialog"
        aria-modal="true"
        style={{
          transitionDuration: `${isVisible ? SHEET_OPEN_MS : SHEET_CLOSE_MS}ms`,
        }}
      >
        <div className={styles.topBar}>
          <div className={styles.handle} />
          <div className={styles.header}>
            <div className={styles.side}>{leftAction}</div>
            <h2 className={styles.title}>{title}</h2>
            <div className={`${styles.side} ${styles.sideRight}`}>{rightAction}</div>
          </div>
        </div>
        <div className={styles.content}>{children}</div>
        {bottomAction && (
          <div className={styles.bottomAction}>{bottomAction}</div>
        )}
      </div>
    </>
  );
}
