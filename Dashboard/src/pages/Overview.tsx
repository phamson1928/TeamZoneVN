import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';
import {
    Users,
    MapPin,
    UsersRound,
    AlertTriangle,
    Loader2,
    TrendingUp,
    MessageSquare,
    Download,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';

const fetchStats = async () => (await apiClient.get('/dashboard/stats')).data.data;
const fetchUsersChart = async () => (await apiClient.get('/dashboard/charts/users?period=7d')).data.data;
const fetchActivityChart = async () => (await apiClient.get('/dashboard/charts/activity?period=7d')).data.data;
const fetchSocialChart = async () => (await apiClient.get('/dashboard/charts/social-engagement?period=7d')).data.data;
const fetchQuickMatchChart = async () => (await apiClient.get('/dashboard/charts/quick-match?period=7d')).data.data;

export const Overview = () => {
    const { data: stats, isLoading: isStatsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: fetchStats });
    const { data: usersChart, isLoading: isUsersChartLoading } = useQuery({ queryKey: ['dashboard-users-chart'], queryFn: fetchUsersChart });
    const { data: activityChart, isLoading: isActivityChartLoading } = useQuery({ queryKey: ['dashboard-activity-chart'], queryFn: fetchActivityChart });
    const { data: socialChart, isLoading: isSocialChartLoading } = useQuery({ queryKey: ['dashboard-social-chart'], queryFn: fetchSocialChart });
    const { data: qmChart, isLoading: isQmChartLoading } = useQuery({ queryKey: ['dashboard-qm-chart'], queryFn: fetchQuickMatchChart });

    if (isStatsLoading) {
        return (
            <div className="flex h-[600px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const { users, zones, groups, reports, growth, social } = stats;

    // Calculate Growth percentages
    const previousWeekUsers = growth.activeUsersThisWeek - growth.newUsersThisWeek; // simplified baseline
    const growthRate = previousWeekUsers > 0 ? ((growth.newUsersThisWeek / previousWeekUsers) * 100).toFixed(1) : 0;

    const handleExport = () => {
        if (!stats) return;
        
        const timestamp = new Date().toISOString().split('T')[0];
        const headers = ["Category", "Metric", "Value"];
        const rows = [
            ["Users", "Total Registered", users.total],
            ["Users", "Active This Week", growth.activeUsersThisWeek],
            ["Users", "New This Week", growth.newUsersThisWeek],
            ["Zones", "Total Zones", zones.total],
            ["Zones", "Open Status", zones.open],
            ["Groups", "Active Groups", groups.active],
            ["Engagement", "Total Friendships", social.totalFriendships],
            ["Engagement", "Total Likes", social.totalUserLikes]
        ];

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `teamzone_report_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Báo cáo hệ thống đã được tải xuống.');
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto auto-rows-max">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Tổng quan Phân tích</h1>
                    <p className="text-gray-500 mt-2 font-medium">Thống kê và chỉ số hệ thống trong 7 ngày qua</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-full border border-gray-200/60 shadow-sm backdrop-blur-xl">
                   <button 
                     onClick={handleExport}
                     className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold hover:scale-105 active:scale-95 transition-transform duration-200"
                   >
                       <Download className="h-4 w-4" strokeWidth={2.5}/> Xuất báo cáo
                   </button>
                </div>
            </div>

            {/* Luxury Premium Minimalist Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                
                {/* Users Card */}
                <div className="relative p-7 bg-white/40 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-400 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:bg-white/50 group">
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 mix-blend-overlay"></div>
                    
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em] leading-none">Người dùng</h3>
                        <div className="p-2.5 bg-gray-50/50 rounded-2xl border border-gray-100/50 text-gray-400 group-hover:text-gray-900 group-hover:bg-white transition-all duration-300 shadow-sm">
                            <Users strokeWidth={1.5} className="w-[22px] h-[22px]" />
                        </div>
                    </div>
                    
                    <div>
                        <p className="text-[44px] font-bold text-gray-900 tracking-[-0.04em] leading-none mb-4">
                            {users.total.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-3.5">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                                <span className="text-[12.5px] font-semibold text-gray-500">{users.active} Active</span>
                            </div>
                            <div className="w-[1px] h-3.5 bg-gray-200"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.8)]"></div>
                                <span className="text-[12.5px] font-semibold text-gray-500">{users.banned} Banned</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Zones Card */}
                <div className="relative p-7 bg-white/40 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-400 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:bg-white/50 group">
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 mix-blend-overlay"></div>
                    
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em] leading-none">Tổng Zone</h3>
                        <div className="p-2.5 bg-gray-50/50 rounded-2xl border border-gray-100/50 text-gray-400 group-hover:text-gray-900 group-hover:bg-white transition-all duration-300 shadow-sm">
                            <MapPin strokeWidth={1.5} className="w-[22px] h-[22px]" />
                        </div>
                    </div>
                    
                    <div>
                        <p className="text-[44px] font-bold text-gray-900 tracking-[-0.04em] leading-none mb-4">
                            {zones.total.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-3.5">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></div>
                                <span className="text-[12.5px] font-semibold text-gray-500">{zones.open} Mở</span>
                            </div>
                            <div className="w-[1px] h-3.5 bg-gray-200"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]"></div>
                                <span className="text-[12.5px] font-semibold text-gray-500">{zones.full} Đầy</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Groups Card */}
                <div className="relative p-7 bg-white/40 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-400 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:bg-white/50 group">
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 mix-blend-overlay"></div>
                    
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em] leading-none">Nhóm</h3>
                        <div className="p-2.5 bg-gray-50/50 rounded-2xl border border-gray-100/50 text-gray-400 group-hover:text-gray-900 group-hover:bg-white transition-all duration-300 shadow-sm">
                            <UsersRound strokeWidth={1.5} className="w-[22px] h-[22px]" />
                        </div>
                    </div>
                    
                    <div>
                        <p className="text-[44px] font-bold text-gray-900 tracking-[-0.04em] leading-none mb-4">
                            {groups.active.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-3.5">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                                <span className="text-[12.5px] font-semibold text-gray-500">{groups.total} Tổng số</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reports Card */}
                <div className="relative p-7 bg-white/40 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-400 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:bg-white/50 group">
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 mix-blend-overlay"></div>
                    
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em] leading-none">Báo cáo</h3>
                        <div className="p-2.5 bg-gray-50/50 rounded-2xl border border-gray-100/50 text-gray-400 group-hover:text-gray-900 group-hover:bg-white transition-all duration-300 shadow-sm">
                            <AlertTriangle strokeWidth={1.5} className="w-[22px] h-[22px]" />
                        </div>
                    </div>
                    
                    <div>
                        <p className="text-[44px] font-bold text-gray-900 tracking-[-0.04em] leading-none mb-4">
                            {reports.open}
                        </p>
                        <div className="flex items-center gap-3.5">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)] flex items-center justify-center animate-pulse"></div>
                                <span className="text-[12.5px] font-semibold text-gray-500">{reports.total} Cần xử lý</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* User Registration Chart */}
                <div className="lg:col-span-2 p-8 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-[420px]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Người dùng Đăng ký (7 Ngày)</h3>
                            <p className="text-sm font-medium text-gray-500 mt-1">Xu hướng tài khoản mới tăng trưởng</p>
                        </div>
                        <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-100">
                            +{growth.newUsersThisWeek} tuần này
                        </span>
                    </div>

                    <div className="flex-1 w-full relative">
                        {isUsersChartLoading ? (
                            <div className="absolute inset-0 flex justify-center items-center"><Loader2 className="animate-spin h-6 w-6 text-gray-400" /></div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={usersChart?.data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" tickFormatter={(str) => { const d = new Date(str); return `${d.getDate()}/${d.getMonth() + 1}`; }} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} />
                                    <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="4 4" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                                        itemStyle={{ color: '#4f46e5', fontWeight: 700 }}
                                    />
                                    <Area type="monotone" dataKey="count" name="Người dùng mới" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Info Widget */}
                <div className="flex flex-col gap-6">
                    <div className="p-6 rounded-[32px] bg-gray-900 text-white shadow-lg relative overflow-hidden flex-1">
                        <div className="absolute top-0 right-0 p-8 transform translate-x-1/4 -translate-y-1/4 opacity-10">
                            <TrendingUp className="h-40 w-40" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-300">Tăng trưởng Tuần</h3>
                        <div className="mt-4 flex items-baseline gap-2">
                            <p className="text-5xl font-black tracking-tighter">
                                {Number(growthRate) > 0 ? '+' : ''}{growthRate}%
                            </p>
                        </div>
                        <p className="text-sm font-medium text-gray-400 mt-2 leading-relaxed">
                            So với tuần trước, số dư tài khoản hoạt động tăng trưởng với tốc độ rất tốt.
                        </p>

                        <div className="mt-6 border-t border-gray-800 pt-6">
                            <p className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Tương tác xã hội</p>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-400">Kết bạn</span>
                                    <span className="font-bold">{social?.totalFriendships?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-400">Lượt thích</span>
                                    <span className="font-bold">{social?.totalUserLikes?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-400">Hàng đợi ghép nhanh</span>
                                    <span className="font-bold text-emerald-400">{social?.currentQueueSize || 0} người</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Social & Quick Match Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Social Engagement Chart */}
                <div className="p-8 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-[400px]">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Xu hướng Tương tác</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">Lượt thích và yêu cầu kết bạn được chấp nhận</p>
                    </div>
                    <div className="flex-1 w-full relative">
                        {isSocialChartLoading ? (
                            <div className="absolute inset-0 flex justify-center items-center"><Loader2 className="animate-spin h-6 w-6 text-gray-400" /></div>
                        ) : socialChart?.data?.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={socialChart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="date" tickFormatter={(str) => { const d = new Date(str); return `${d.getDate()}/${d.getMonth() + 1}`; }} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} />
                                    <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="4 4" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                                    />
                                    <Area type="monotone" dataKey="likes" name="Lượt thích" stroke="#ec4899" strokeWidth={3} fillOpacity={0.1} fill="#ec4899" />
                                    <Area type="monotone" dataKey="friendships" name="Kết bạn mới" stroke="#3b82f6" strokeWidth={3} fillOpacity={0.1} fill="#3b82f6" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                               <TrendingUp className="w-10 h-10 mb-2 opacity-20" />
                               <p className="text-sm font-bold">Chưa có dữ liệu tương tác</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Match Efficiency Chart */}
                <div className="p-8 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-[400px]">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Hiệu quả Ghép nhanh</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">Số lượng ghép thành công theo từng Game</p>
                    </div>
                    <div className="flex-1 w-full relative">
                        {isQmChartLoading ? (
                            <div className="absolute inset-0 flex justify-center items-center"><Loader2 className="animate-spin h-6 w-6 text-gray-400" /></div>
                        ) : qmChart?.matchedByGame?.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={qmChart.matchedByGame} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="gameName" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151', fontWeight: 700 }} width={100} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                                    />
                                    <Bar dataKey="successCount" name="Ghép thành công" fill="#10b981" radius={[0, 6, 6, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                               <AlertTriangle className="w-10 h-10 mb-2 opacity-20" />
                               <p className="text-sm font-bold">Chưa có dữ liệu ghép nhanh</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Activity Bar Chart */}
            <div className="p-8 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-[420px]">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Mật độ Chat theo giờ (Peak Hours)</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">Lượng tin nhắn trong 7 ngày gần nhất hiển thị theo phân bổ khung giờ 24h</p>
                    </div>
                </div>

                <div className="flex-1 w-full relative">
                    {isActivityChartLoading ? (
                        <div className="absolute inset-0 flex justify-center items-center"><Loader2 className="animate-spin h-6 w-6 text-gray-400" /></div>
                    ) : activityChart?.data?.some((d: any) => d.count > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityChart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} dy={10} interval={1} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} />
                                <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="4 4" />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                                />
                                <Bar dataKey="count" name="Tin nhắn đã gửi" fill="#a855f7" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                           <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                           <p className="text-sm font-bold">Chưa có hoạt động chat trong tuần này</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
