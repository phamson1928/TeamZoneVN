import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            pages.push(
                <button key={1} onClick={() => onPageChange(1)} className="h-8 w-8 text-sm font-medium rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(<span key="start-dots" className="px-2 text-gray-400"><MoreHorizontal className="h-4 w-4" /></span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={cn(
                        "h-8 w-8 text-sm font-medium rounded-lg transition-colors border shadow-sm",
                        currentPage === i
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100/50"
                            : "bg-white border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200"
                    )}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="end-dots" className="px-2 text-gray-400"><MoreHorizontal className="h-4 w-4" /></span>);
            }
            pages.push(
                <button key={totalPages} onClick={() => onPageChange(totalPages)} className="h-8 w-8 text-sm font-medium rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 bg-white border-t border-gray-100 rounded-b-2xl mt-4">
            <div className="hidden sm:flex flex-1 justify-between items-center">
                <div>
                    <span className="text-sm font-medium text-gray-500">Trang {currentPage} / {totalPages}</span>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm gap-1" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-lg px-2 py-2 text-gray-400 border border-transparent hover:bg-gray-50 hover:border-gray-200 hover:text-gray-500 focus:z-20 disabled:opacity-50 disabled:pointer-events-none transition-colors mr-2 shadow-sm bg-white"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </button>
                        {renderPageNumbers()}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-lg px-2 py-2 text-gray-400 border border-transparent hover:bg-gray-50 hover:border-gray-200 hover:text-gray-500 focus:z-20 disabled:opacity-50 disabled:pointer-events-none transition-colors ml-2 shadow-sm bg-white"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};
