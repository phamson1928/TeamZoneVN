import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    centered?: boolean;
}

export const LoadingSpinner = ({ className, size = 'md', centered = false }: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12 border-2',
    };

    const spinner = (
        <div className={cn("text-indigo-600 animate-spin", sizeClasses[size], className)}>
            <Loader2 className="w-full h-full" />
        </div>
    );

    if (centered) {
        return (
            <div className="flex flex-col items-center justify-center w-full p-12 min-h-[200px] gap-4">
                {spinner}
                <p className="text-sm font-medium text-gray-500 animate-pulse">Đang tải dữ liệu...</p>
            </div>
        );
    }

    return spinner;
};
