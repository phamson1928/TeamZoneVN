import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    MapPin, // Zones
    UsersRound, // Groups
    ShieldAlert, // Moderation
    LogOut,
    ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigationMenuItems = [
    { name: 'Tổng quan', to: '/', icon: LayoutDashboard },
    { name: 'Quản lý người dùng', to: '/users', icon: Users },
    { name: 'Quản lý Zone', to: '/zones', icon: MapPin },
    { name: 'Quản lý nhóm', to: '/groups', icon: UsersRound },
    { name: 'Kiểm duyệt & Báo cáo', to: '/moderation', icon: ShieldAlert },
];

export const Sidebar = () => {
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="hidden lg:flex flex-col w-[260px] fixed inset-y-0 border-r border-gray-100 bg-white">
            {/* Brand logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100/50">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center mr-3">
                    <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">GameZone</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto font-medium">
                <div className="text-xs font-semibold text-gray-400 mb-3 px-3 uppercase tracking-wider">
                    Chức năng
                </div>
                {navigationMenuItems.map((item) => {
                    const isActive = location.pathname === item.to || (location.pathname.startsWith(item.to) && item.to !== '/');
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            to={item.to}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                                isActive
                                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500")} strokeWidth={isActive ? 2.5 : 2} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Promo Card */}
            <div className="p-4 border-t border-gray-100">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-sm relative overflow-hidden mb-4">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <ShieldCheck className="h-16 w-16 text-indigo-600 -rotate-12 transform scale-150" />
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-white text-indigo-600 text-xs font-bold border border-indigo-100 mb-2">Admin Pro</span>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Cần hỗ trợ?</p>
                    <p className="text-xs text-gray-500 mb-3">Đọc docs hoặc gửi ticket.</p>
                    <button className="w-full bg-gray-900 hover:bg-black text-white py-2 rounded-lg text-xs font-semibold shadow-md transition-all">
                        Xem Docs
                    </button>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all font-medium"
                >
                    <LogOut className="h-5 w-5 text-gray-400" />
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};
