import { FiAlertTriangle, FiInfo } from 'react-icons/fi';
import Modal from './Modal';
import Button from './Button';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this administrative action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={!isLoading}
    >
      <div className="flex items-start gap-3.5 pt-1">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            variant === 'danger'
              ? 'bg-red-50 text-danger'
              : variant === 'warning'
              ? 'bg-amber-50 text-warning'
              : 'bg-blue-50 text-[#123B66]'
          }`}
        >
          {variant === 'danger' || variant === 'warning' ? (
            <FiAlertTriangle className="w-5 h-5" />
          ) : (
            <FiInfo className="w-5 h-5" />
          )}
        </div>

        <div>
          <h4 className="text-base font-semibold text-slate-900 font-geist leading-tight">
            {title}
          </h4>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={isLoading}
          onClick={onClose}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          size="sm"
          isLoading={isLoading}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
