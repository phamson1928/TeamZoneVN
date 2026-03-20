import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    MapPin,
    UsersRound,
    ShieldAlert,
    LogOut,
    ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigationMenuItems = [
    { name: 'Tổng quan', to: '/', icon: LayoutDashboard },
    { name: 'Người dùng', to: '/users', icon: Users },
    { name: 'Zone', to: '/zones', icon: MapPin },
    { name: 'Nhóm', to: '/groups', icon: UsersRound },
    { name: 'Kiểm duyệt', to: '/moderation', icon: ShieldAlert },
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
        <div className="hidden lg:flex flex-col w-[240px] fixed inset-y-0 z-30">
            {/* Apple-style frosted-glass sidebar */}
            <div className="flex flex-col h-full mx-3 my-3 rounded-[28px] overflow-hidden
                            bg-white/75 backdrop-blur-2xl border border-white/60
                            shadow-[0_8px_32px_rgba(0,0,0,0.08)]">

                {/* Brand */}
                <div className="flex items-center gap-3.5 px-6 pt-7 pb-6">
                    <div className="h-10 w-10 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <ShieldCheck className="h-6 w-6 text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                        <span className="text-[16px] font-extrabold tracking-tight text-gray-900 block leading-tight">GameZone</span>
                        <span className="text-[11px] font-bold text-gray-400 block mt-0.5 tracking-wide uppercase">Control Center</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                    <p className="text-[10px] font-bold text-gray-400 mb-2 px-2 uppercase tracking-[0.12em]">Quản lý</p>
                    {navigationMenuItems.map((item) => {
                        const isActive = location.pathname === item.to || (location.pathname.startsWith(item.to) && item.to !== '/');
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.to}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-all duration-200 text-[13.5px] font-semibold",
                                    isActive
                                        ? "bg-gray-900 text-white shadow-sm"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-black/5"
                                )}
                            >
                                <Icon className={cn("h-[18px] w-[18px] flex-shrink-0", isActive ? "text-white" : "text-gray-400")} strokeWidth={isActive ? 2.2 : 1.8} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-3 pb-4 pt-3 border-t border-gray-100/80">
                    {/* Promo card */}
                    <div className="mb-2 p-4 rounded-[18px] bg-gradient-to-br from-gray-50 to-gray-100/60 border border-gray-200/60 relative overflow-hidden">
                        <div className="absolute -right-3 -top-3 opacity-[0.07]">
                            <ShieldCheck className="h-20 w-20 text-gray-900" />
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-gray-900 text-white text-[10px] font-bold mb-2">Pro</span>
                        <p className="text-[13px] font-bold text-gray-900 leading-snug">Cần hỗ trợ?</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 mb-3">Đọc tài liệu hoặc gửi ticket.</p>
                        <button className="w-full bg-gray-900 hover:bg-black text-white py-2 rounded-[10px] text-[12px] font-semibold transition-all active:scale-95">
                            Xem Docs
                        </button>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-[14px] text-gray-400 hover:text-red-500 hover:bg-red-50/80 transition-all font-semibold text-[13.5px]"
                    >
                        <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
};
