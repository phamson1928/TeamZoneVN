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
    Gamepad2,
    Trophy,
    Heart
} from 'lucide-react';
import { toast } from 'sonner';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { StaggerContainer, StaggerItem, AnimatedCard } from '../components/layout/PageTransition';

// Interceptor unpacks { success: true, data: X } → X
// GET /dashboard/stats → { users, zones, groups, reports, growth }
const fetchStats = async () => await apiClient.get('/dashboard/stats') as any;
// GET /dashboard/charts/* → { period, label, data: [...] }
const fetchUsersChart = async () => await apiClient.get('/dashboard/charts/users?period=7d') as any;
const fetchActivityChart = async () => await apiClient.get('/dashboard/charts/activity?period=7d') as any;
const fetchSocialChart = async () => await apiClient.get('/dashboard/charts/social-engagement?period=7d') as any;
const fetchQuickMatchChart = async () => await apiClient.get('/dashboard/charts/quick-match?period=7d') as any;
const fetchReportsChart = async () => await apiClient.get('/dashboard/charts/reports?period=7d') as any;
const fetchEngagementChart = async () => await apiClient.get('/dashboard/charts/engagement?period=7d') as any;
const fetchTopGamesChart = async () => await apiClient.get('/dashboard/charts/top-games') as any;
const fetchLeaderboardTop = async () => await apiClient.get('/dashboard/charts/leaderboard-top') as any;


export const Overview = () => {
    const { data: stats, isLoading: isStatsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: fetchStats });
    const { data: usersChart, isLoading: isUsersChartLoading } = useQuery({ queryKey: ['dashboard-users-chart'], queryFn: fetchUsersChart });
    const { data: activityChart, isLoading: isActivityChartLoading } = useQuery({ queryKey: ['dashboard-activity-chart'], queryFn: fetchActivityChart });
    const { data: socialChart, isLoading: isSocialChartLoading } = useQuery({ queryKey: ['dashboard-social-chart'], queryFn: fetchSocialChart });
    const { data: qmChart, isLoading: isQmChartLoading } = useQuery({ queryKey: ['dashboard-qm-chart'], queryFn: fetchQuickMatchChart });
    const { data: reportsChart, isLoading: isReportsChartLoading } = useQuery({ queryKey: ['dashboard-reports-chart'], queryFn: fetchReportsChart });
    const { data: engagementChart, isLoading: isEngagementChartLoading } = useQuery({ queryKey: ['dashboard-engagement-chart'], queryFn: fetchEngagementChart });
    const { data: topGamesChart, isLoading: isTopGamesChartLoading } = useQuery({ queryKey: ['dashboard-top-games-chart'], queryFn: fetchTopGamesChart });
    const { data: leaderboardTop, isLoading: isLeaderboardLoading } = useQuery({ queryKey: ['dashboard-leaderboard-top'], queryFn: fetchLeaderboardTop });

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
                <div className="flex bg-white/50 p-1 rounded-2xl border border-gray-200/60 shadow-sm backdrop-blur-xl">
                   <button 
                     onClick={handleExport}
                     className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-200 transition-all active:scale-95"
                   >
                       <Download className="h-4 w-4" strokeWidth={2.5}/> Xuất báo cáo
                   </button>
                </div>
            </div>

            {/* Luxury Premium Minimalist Cards */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                
                {/* Users Card */}
                <AnimatedCard className="relative p-7 bg-white/40 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden transition-colors duration-400 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:bg-white/50 group">
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
                </AnimatedCard>

                {/* Zones Card */}
                <AnimatedCard className="relative p-7 bg-white/40 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden transition-colors duration-400 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:bg-white/50 group">
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
                </AnimatedCard>

                {/* Groups Card */}
                <AnimatedCard className="relative p-7 bg-white/40 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden transition-colors duration-400 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:bg-white/50 group">
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
                </AnimatedCard>

                {/* Reports Card */}
                <AnimatedCard className="relative p-7 bg-white/40 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden transition-colors duration-400 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:bg-white/50 group">
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
                                <span className="text-[12.5px] font-semibold text-gray-500">{reports.open} Chưa xử lý</span>
                            </div>
                        </div>
                    </div>
                </AnimatedCard>
            </StaggerContainer>

            {/* Charts Section */}
            <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-6" delayOrder={0.15}>

                {/* User Registration Chart */}
                <StaggerItem className="lg:col-span-2 p-8 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-[420px]">
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
                </StaggerItem>

                {/* Info Widget */}
                <StaggerItem className="flex flex-col gap-6">
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
                </StaggerItem>

            </StaggerContainer>

            {/* Social & Quick Match Row */}
            <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6" delayOrder={0.2}>
                
                {/* Social Engagement Chart */}
                <StaggerItem className="p-8 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-[400px]">
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
                </StaggerItem>

                {/* Quick Match Efficiency Chart */}
                <StaggerItem className="p-8 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-[400px]">
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
                </StaggerItem>

            </StaggerContainer>

            {/* Content & Action Row */}
            <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6" delayOrder={0.25}>
                {/* Engagement Chart */}
                <StaggerItem className="p-8 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-[400px]">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Mức độ tương tác (Zones & Groups)</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">Xu hướng tạo mới trong 7 ngày qua</p>
                    </div>
                    <div className="flex-1 w-full relative">
                        {isEngagementChartLoading ? (
                            <div className="absolute inset-0 flex justify-center items-center"><Loader2 className="animate-spin h-6 w-6 text-gray-400" /></div>
                        ) : engagementChart?.data?.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={engagementChart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="date" tickFormatter={(str) => { const d = new Date(str); return `${d.getDate()}/${d.getMonth() + 1}`; }} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} />
                                    <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="4 4" />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }} />
                                    <Area type="monotone" dataKey="zones" name="Zones tạo mới" stroke="#8b5cf6" strokeWidth={3} fillOpacity={0.1} fill="#8b5cf6" />
                                    <Area type="monotone" dataKey="groups" name="Groups tạo mới" stroke="#f59e0b" strokeWidth={3} fillOpacity={0.1} fill="#f59e0b" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                               <MapPin className="w-10 h-10 mb-2 opacity-20" />
                               <p className="text-sm font-bold">Chưa có dữ liệu</p>
                            </div>
                        )}
                    </div>
                </StaggerItem>

                {/* Reports Trend */}
                <StaggerItem className="p-8 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-[400px]">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Xu hướng Báo cáo (Reports)</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">Lượng vi phạm bị báo cáo hiển thị theo ngày</p>
                    </div>
                    <div className="flex-1 w-full relative">
                        {isReportsChartLoading ? (
                            <div className="absolute inset-0 flex justify-center items-center"><Loader2 className="animate-spin h-6 w-6 text-gray-400" /></div>
                        ) : reportsChart?.data?.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={reportsChart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="date" tickFormatter={(str) => { const d = new Date(str); return `${d.getDate()}/${d.getMonth() + 1}`; }} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} />
                                    <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="4 4" />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }} />
                                    <Area type="step" dataKey="count" name="Số lượng" stroke="#ef4444" strokeWidth={3} fillOpacity={0.1} fill="#ef4444" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                               <AlertTriangle className="w-10 h-10 mb-2 opacity-20" />
                               <p className="text-sm font-bold">Chưa có dữ liệu</p>
                            </div>
                        )}
                    </div>
                </StaggerItem>
            </StaggerContainer>

            {/* Moderation & Top Games Row */}
            <StaggerContainer className="grid grid-cols-1 gap-6" delayOrder={0.3}>


                {/* Top Games Chart */}
                <StaggerItem className="p-8 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-[400px]">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Game Yêu thích (Top 10)</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">Xếp hạng game theo lượng người quan tâm</p>
                    </div>
                    <div className="flex-1 w-full relative">
                        {isTopGamesChartLoading ? (
                            <div className="absolute inset-0 flex justify-center items-center"><Loader2 className="animate-spin h-6 w-6 text-gray-400" /></div>
                        ) : topGamesChart?.data?.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topGamesChart.data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151', fontWeight: 700 }} width={120} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }} />
                                    <Bar dataKey="activeUsers" name="Người chơi" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={16} />
                                    <Bar dataKey="zones" name="Zones" fill="#a855f7" radius={[0, 6, 6, 0]} barSize={16} />
                                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '12px' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                               <Gamepad2 className="w-10 h-10 mb-2 opacity-20" />
                               <p className="text-sm font-bold">Chưa có dữ liệu sở thích Game</p>
                            </div>
                        )}
                    </div>
                </StaggerItem>
            </StaggerContainer>

            {/* Leaderboard Top 10 */}
            <StaggerContainer className="w-full" delayOrder={0.35}>
                <StaggerItem className="p-8 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-[420px]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-amber-500" />
                                Bảng Xếp Hạng Nổi Bật (Top 10)
                            </h3>
                            <p className="text-sm font-medium text-gray-500 mt-1">Những người dùng có sức ảnh hưởng và đóng góp nhiều nhất</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full overflow-x-auto relative min-h-[250px]">
                        {isLeaderboardLoading ? (
                            <div className="absolute inset-0 flex justify-center items-center"><Loader2 className="animate-spin h-6 w-6 text-gray-400" /></div>
                        ) : leaderboardTop?.data?.length ? (
                            <table className="w-full text-sm text-left align-middle border-collapse mt-2">
                                <thead className="text-gray-400 font-medium border-b border-gray-100/80 uppercase tracking-widest text-[10px]">
                                    <tr>
                                        <th className="px-6 py-4">Hạng</th>
                                        <th className="px-6 py-4">Người dùng</th>
                                        <th className="px-6 py-4 text-right">Lượt thích</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100/80">
                                    {leaderboardTop.data.map((user: any, index: number) => (
                                        <tr key={user.id || `user-rank-${index}`} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-gray-100 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-transparent text-gray-400 border border-gray-200'}`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full border border-gray-100 object-cover shadow-sm" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-bold text-sm">
                                                            {user.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-900">{user.username}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">{user.email || 'No email'}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-right">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 font-bold rounded-xl text-sm">
                                                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                                                    {user.likeCount || 0}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 opacity-60">
                               <Users className="w-10 h-10 mb-2 opacity-20" />
                               <p className="text-sm font-bold">Chưa có dữ liệu xếp hạng</p>
                            </div>
                        )}
                    </div>
                </StaggerItem>
            </StaggerContainer>

            {/* Activity Bar Chart */}
            <StaggerContainer className="w-full" delayOrder={0.4}>
                <StaggerItem className="p-8 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-[420px]">
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
            </StaggerItem>
            </StaggerContainer>
        </div>
    );
};
