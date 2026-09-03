import { useEffect, useRef } from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) => {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    cancelButtonRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog__icon" aria-hidden="true">{danger ? '🗑️' : '✨'}</div>
        <h2 id="confirm-dialog-title" className="confirm-dialog__title">{title}</h2>
        <p id="confirm-dialog-message" className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <button ref={cancelButtonRef} type="button" className="confirm-dialog__cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-dialog__confirm ${danger ? 'confirm-dialog__confirm--danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
