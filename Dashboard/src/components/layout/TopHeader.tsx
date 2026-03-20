import { Search, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const getTitleFromPath = (path: string) => {
    if (path === '/') return 'Tổng quan';
    if (path.startsWith('/users')) return 'Quản lý người dùng';
    if (path.startsWith('/zones')) return 'Quản lý Zone';
    if (path.startsWith('/groups')) return 'Quản lý nhóm';
    if (path.startsWith('/moderation')) return 'Kiểm duyệt & Báo cáo';
    return 'Bảng điều khiển';
};

const getDescFromPath = (path: string) => {
    if (path === '/') return 'Tổng hợp chỉ số hệ thống';
    if (path.startsWith('/users')) return 'Quản lý tài khoản và phân quyền';
    if (path.startsWith('/zones')) return 'Giám sát phòng tìm bạn chơi game';
    if (path.startsWith('/groups')) return 'Quản lý nhóm và liên kết';
    if (path.startsWith('/moderation')) return 'Xử lý báo cáo và nội dung vi phạm';
    return '';
};

export const TopHeader = () => {
    const location = useLocation();
    const pageTitle = getTitleFromPath(location.pathname);
    const pageDesc = getDescFromPath(location.pathname);

    const adminProfile = {
        name: 'Admin TeamZone',
        role: 'Root Admin',
        avatar: 'AT'
    };

    return (
        <header className="sticky top-0 z-40 px-4 pt-3 pb-0">
            {/* Floating pill header — Apple style */}
            <div className="flex items-center justify-between h-14 bg-white/80 backdrop-blur-2xl rounded-2xl border border-gray-200/60 shadow-[0_2px_16px_rgba(0,0,0,0.05)] px-4">
                {/* Left: Title */}
                <div className="flex flex-col justify-center">
                    <h1 className="text-[15px] font-bold text-gray-900 leading-none tracking-tight">{pageTitle}</h1>
                    <p className="text-[12px] text-gray-400 font-medium mt-0.5 leading-none">{pageDesc}</p>
                </div>

                {/* Right: Search + Bell + Profile */}
                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative hidden md:block group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="w-44 xl:w-56 bg-gray-50 border border-gray-200/60 rounded-full py-2 pl-8 pr-4 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-gray-200 focus:border-gray-300 focus:bg-white transition-all outline-none placeholder:text-gray-400"
                        />
                    </div>

                    {/* Bell */}
                    <button className="relative h-9 w-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200/60 hover:bg-gray-100 transition-colors">
                        <Bell className="h-4 w-4 text-gray-500" strokeWidth={1.8}/>
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full border-[1.5px] border-white" />
                    </button>

                    {/* Divider */}
                    <div className="h-6 w-px bg-gray-200 mx-1" />

                    {/* Profile capsule */}
                    <div className="flex items-center gap-2 pl-1 pr-1 py-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-[13px] font-bold text-gray-900 leading-tight">{adminProfile.name}</span>
                            <span className="text-[11px] font-medium text-gray-400">{adminProfile.role}</span>
                        </div>
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-[12px] font-bold text-white shadow-sm">
                            {adminProfile.avatar}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
