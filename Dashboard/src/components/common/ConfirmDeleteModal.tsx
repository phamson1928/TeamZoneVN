
import { AlertCircle, X, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
}

export const ConfirmDeleteModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Bạn có chắc chắn muốn xóa?',
    description = 'Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống.',
    confirmLabel = 'Xóa vĩnh viễn',
    cancelLabel = 'Hủy bỏ',
    isDestructive = true
}: ConfirmDeleteModalProps) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal panel */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-gray-100">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="bg-white px-6 pb-6 pt-8">
                        <div className="sm:flex sm:items-start text-center sm:text-left gap-4">
                            <div className={cn(
                                "mx-auto flex h-14 w-14 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 shadow-sm",
                                isDestructive ? "bg-red-50 text-red-600 border border-red-100" : "bg-orange-50 text-orange-600 border border-orange-100"
                            )}>
                                {isDestructive ? <ShieldAlert className="h-6 w-6" aria-hidden="true" /> : <AlertCircle className="h-6 w-6" aria-hidden="true" />}
                            </div>
                            <div className="mt-4 sm:mt-0 flex-1">
                                <h3 className="text-xl font-bold leading-6 text-gray-900 mb-2">
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-500 leading-relaxed">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50/50 px-6 py-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end border-t border-gray-100">
                        <button
                            type="button"
                            className="inline-flex w-full justify-center items-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto transition-colors"
                            onClick={onClose}
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            className={cn(
                                "inline-flex w-full justify-center items-center rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md sm:w-auto transition-all active:scale-95",
                                isDestructive
                                    ? "bg-red-600 text-white hover:bg-red-500 shadow-red-600/20"
                                    : "bg-orange-600 text-white hover:bg-orange-500 shadow-orange-600/20"
                            )}
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
