import { Search, Bell, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const getTitleFromPath = (path: string) => {
    if (path === '/') return 'Tổng quan';
    if (path.startsWith('/users')) return 'Quản lý người dùng';
    if (path.startsWith('/zones')) return 'Quản lý Zone';
    if (path.startsWith('/groups')) return 'Quản lý nhóm';
    if (path.startsWith('/moderation')) return 'Kiểm duyệt & Báo cáo';
    return 'Bảng điều khiển';
};

export const TopHeader = () => {
    const location = useLocation();
    const pageTitle = getTitleFromPath(location.pathname);

    // In a real app we'd fetch this from Auth context/store
    const adminProfile = {
        name: 'Admin TeamZone',
        role: 'Root Admin',
        avatar: 'AD'
    };

    return (
        <header className="h-[72px] border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 lg:px-8">
            {/* Left side: Mobile menu & Title */}
            <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 -ml-2 text-gray-400 hover:bg-gray-50 rounded-lg">
                    <Menu className="h-6 w-6" />
                </button>
                <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">{pageTitle}</h1>
                    <p className="text-sm font-medium text-gray-500">Quản lý chỉ số hệ thống và cấu hình</p>
                </div>
            </div>

            {/* Right side: Search, Notifications, Profile */}
            <div className="flex items-center gap-4 lg:gap-6">
                {/* Search Bar */}
                <div className="relative max-w-sm w-full hidden md:block group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="w-48 xl:w-64 bg-gray-50/50 hover:bg-gray-100/50 focus:bg-white border hover:border-gray-200 border-transparent rounded-full py-2 pl-9 pr-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none shadow-sm placeholder:text-gray-400"
                    />
                </div>

                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors relative border border-transparent hover:border-gray-200 shadow-sm">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full border border-white" />
                </button>

                {/* Separator */}
                <div className="h-8 w-px bg-gray-200 hidden sm:block" />

                {/* User Profile */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col text-right">
                        <span className="text-sm font-bold text-gray-900 leading-tight">{adminProfile.name}</span>
                        <span className="text-xs font-semibold text-gray-500">{adminProfile.role}</span>
                    </div>
                    <button className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] shadow-sm hover:shadow-md transition-all active:scale-95">
                        <div className="w-full h-full rounded-full border-2 border-white bg-white flex items-center justify-center text-xs font-bold text-indigo-600">
                            {adminProfile.avatar}
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};
