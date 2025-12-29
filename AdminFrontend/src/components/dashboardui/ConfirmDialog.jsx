import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';


export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  isLoading = false
}) {
  const getButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'destructive';
      case 'success':
        return 'primary';
      default:
        return 'primary';
    }
  };
  return <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="sm:flex sm:items-start">
        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
          <AlertTriangle className={`h-6 w-6 ${variant === 'danger' ? 'text-red-600' : 'text-amber-600'}`} aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {title}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button variant={getButtonVariant()} onClick={onConfirm} isLoading={isLoading} className="w-full sm:w-auto sm:ml-3">
          {confirmLabel}
        </Button>
        <Button variant="secondary" onClick={onClose} disabled={isLoading} className="mt-3 w-full sm:mt-0 sm:w-auto">
          {cancelLabel}
        </Button>
      </div>
    </Modal>;
}