import { Search, Bell, CheckCircle2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/axios';

const timeAgo = (date: Date | string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return Math.floor(seconds) + " giây trước";
};

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
    const queryClient = useQueryClient();
    const pageTitle = getTitleFromPath(location.pathname);
    const pageDesc = getDescFromPath(location.pathname);
    const [showNotif, setShowNotif] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const { data: notifData } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res: any = await apiClient.get('/notifications?limit=5');
            return res || { items: [], unreadCount: 0 };
        },
        refetchInterval: 10000
    });

    // Fetch stats for System Alerts
    const { data: stats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            return await apiClient.get('/dashboard/stats') as any;
        },
        refetchInterval: 30000
    });

    const openReportsCount = stats?.reports?.open || 0;
    const queueSize = stats?.social?.currentQueueSize || 0;
    
    // Total unread = personal unread + system alerts
    const systemAlertsCount = (openReportsCount > 0 ? 1 : 0) + (queueSize > 50 ? 1 : 0);
    const totalUnreadCount = (notifData?.unreadCount ?? 0) + systemAlertsCount;

    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            await apiClient.patch('/notifications/read-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Đã dọn dẹp tất cả thông báo!');
            setShowNotif(false);
        }
    });

    const markReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.patch(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotif(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm nhanh..."
                            onClick={() => toast('Tính năng tìm kiếm toàn cục đang được tích hợp...')}
                            className="w-44 xl:w-56 bg-gray-50 border border-transparent rounded-[12px] py-2 pl-9 pr-4 text-[13px] font-bold text-gray-900 focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-gray-400"
                        />
                    </div>

                    {/* Bell */}
                    <div className="relative" ref={notifRef}>
                        <button 
                            onClick={() => setShowNotif(!showNotif)}
                            className={`relative h-9 w-9 flex items-center justify-center rounded-[12px] transition-all active:scale-95 ${showNotif ? 'bg-indigo-50 text-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.15)]' : 'bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                        >
                            <Bell className="h-4 w-4" strokeWidth={showNotif ? 2.5 : 2}/>
                            {totalUnreadCount > 0 && (
                                <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full border-[1.5px] border-white animate-pulse" />
                            )}
                        </button>

                        {showNotif && (
                            <div className="absolute top-full right-0 mt-3 w-80 bg-white/90 backdrop-blur-3xl border border-white/60 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden animate-in slide-in-from-top-2 fade-in">
                                <div className="p-4 border-b border-gray-100/50 flex justify-between items-center bg-white/50">
                                    <h3 className="font-bold text-gray-900 leading-none">Thông báo & Cảnh báo</h3>
                                    {totalUnreadCount > 0 && (
                                        <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-2.5 py-1 rounded-[8px] uppercase tracking-widest">{totalUnreadCount} Mới</span>
                                    )}
                                </div>
                                <div className="p-2 space-y-1 max-h-[350px] overflow-y-auto">
                                    {/* System Alerts */}
                                    {openReportsCount > 0 && (
                                        <div className="p-3 bg-amber-50/50 hover:bg-amber-50 rounded-[16px] cursor-pointer transition-colors group border border-amber-100/50">
                                            <p className="text-xs font-bold text-gray-900 group-hover:text-amber-600 transition-colors flex items-center gap-1.5">
                                                Cảnh báo hệ thống (System)
                                            </p>
                                            <p className="text-xs font-medium text-gray-600 mt-1 line-clamp-2">
                                                Có <span className="font-bold text-amber-600">{openReportsCount}</span> báo cáo vi phạm đang chờ bạn kiểm duyệt.
                                            </p>
                                            <p className="text-[10px] font-bold text-amber-500/70 mt-2 uppercase tracking-wide">Thời gian thực</p>
                                        </div>
                                    )}
                                    {queueSize > 50 && (
                                        <div className="p-3 bg-rose-50/50 hover:bg-rose-50 rounded-[16px] cursor-pointer transition-colors group border border-rose-100/50">
                                            <p className="text-xs font-bold text-gray-900 group-hover:text-rose-600 transition-colors flex items-center gap-1.5">
                                                Cảnh báo tải (Server Load)
                                            </p>
                                            <p className="text-xs font-medium text-gray-600 mt-1 line-clamp-2">
                                                Hàng đợi ghép nhanh đang quá tải với <span className="font-bold text-rose-600">{queueSize}</span> người chờ.
                                            </p>
                                            <p className="text-[10px] font-bold text-rose-500/70 mt-2 uppercase tracking-wide">Thời gian thực</p>
                                        </div>
                                    )}

                                    {/* Personal Notifications */}
                                    {notifData?.items?.length > 0 ? notifData.items.map((item: any) => (
                                        <div key={item.id} onClick={() => { if (!item.isRead) markReadMutation.mutate(item.id); }} className={`p-3 rounded-[16px] cursor-pointer transition-colors group ${item.isRead ? 'opacity-60 hover:bg-gray-50/50' : 'bg-indigo-50/30 hover:bg-indigo-50'}`}>
                                            <p className={`text-xs font-bold transition-colors flex items-center gap-1.5 ${item.isRead ? 'text-gray-700' : 'text-gray-900 group-hover:text-indigo-600'}`}>
                                                {item.title}
                                                {item.isRead && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                            </p>
                                            <p className="text-xs font-medium text-gray-500 mt-1 line-clamp-2">{item.message}</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wide">{timeAgo(item.createdAt)}</p>
                                        </div>
                                    )) : (
                                        totalUnreadCount === 0 && (
                                            <div className="p-6 text-center text-gray-400">
                                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                <p className="text-xs font-bold">Không có thông báo nào</p>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div className="p-2 border-t border-gray-100/50 bg-gray-50/30">
                                    <button 
                                        disabled={notifData?.unreadCount === 0}
                                        onClick={() => markAllReadMutation.mutate()} 
                                        className="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 disabled:opacity-50 rounded-[14px] hover:bg-white transition-all">
                                        Đánh dấu đã đọc tất cả
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-6 w-px bg-gray-200/60 mx-1" />

                    {/* Profile capsule */}
                    <div className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-[14px] hover:bg-gray-50 transition-colors cursor-pointer active:scale-95 group border border-transparent hover:border-gray-200/50">
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-[13px] font-bold text-gray-700 group-hover:text-gray-900 leading-tight">{adminProfile.name}</span>
                            <span className="text-[10px] font-black tracking-widest uppercase text-indigo-500/70">{adminProfile.role}</span>
                        </div>
                        <div className="h-8 w-8 flex-shrink-0 rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[11px] font-black text-white shadow-md shadow-indigo-200">
                            {adminProfile.avatar}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
