import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';
import {
    Users,
    MapPin,
    UsersRound,
    AlertTriangle,
    ExternalLink,
    Loader2,
    TrendingUp
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';

const fetchStats = async () => (await apiClient.get('/dashboard/stats')).data.data;
const fetchUsersChart = async () => (await apiClient.get('/dashboard/charts/users?period=7d')).data.data;
const fetchActivityChart = async () => (await apiClient.get('/dashboard/charts/activity?period=7d')).data.data;

export const Overview = () => {
    const { data: stats, isLoading: isStatsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: fetchStats });
    const { data: usersChart, isLoading: isUsersChartLoading } = useQuery({ queryKey: ['dashboard-users-chart'], queryFn: fetchUsersChart });
    const { data: activityChart, isLoading: isActivityChartLoading } = useQuery({ queryKey: ['dashboard-activity-chart'], queryFn: fetchActivityChart });

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

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Tổng quan Phân tích</h2>
                    <p className="text-gray-500 mt-1.5 font-medium">Thống kê và chỉ số hệ thống trong 7 ngày qua</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 w-fit">
                    <ExternalLink className="h-4 w-4" /> Xuất báo cáo
                </button>
            </div>

            {/* Holographic Gradient Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-50 border border-white/60 shadow-sm relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 p-4 opacity-20 hidden sm:block">
                        <Users className="h-14 w-14 text-indigo-900" strokeWidth={1.5} />
                    </div>
                    <div className="relative z-10">
                        <div className="h-10 w-10 rounded-2xl bg-white/70 shadow-sm flex items-center justify-center text-indigo-700 mb-4">
                            <Users className="h-5 w-5" />
                        </div>
                        <p className="text-4xl font-extrabold text-gray-900 tracking-tight">{users.total.toLocaleString()}</p>
                        <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-wider">Tổng người dùng</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="px-2 py-1 bg-white/60 rounded-md text-emerald-700">{users.active} Hoạt động</span>
                            <span className="px-2 py-1 bg-white/60 rounded-md text-rose-700">{users.banned} Bị cấm</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-100 via-cyan-100 to-emerald-100 border border-white/60 shadow-sm relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 p-4 opacity-20 hidden sm:block">
                        <MapPin className="h-14 w-14 text-teal-900" strokeWidth={1.5} />
                    </div>
                    <div className="relative z-10">
                        <div className="h-10 w-10 rounded-2xl bg-white/70 shadow-sm flex items-center justify-center text-teal-700 mb-4">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <p className="text-4xl font-extrabold text-gray-900 tracking-tight">{zones.total.toLocaleString()}</p>
                        <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-wider">Tổng Zone</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="px-2 py-1 bg-white/60 rounded-md text-emerald-700">{zones.open} Đang mở</span>
                            <span className="px-2 py-1 bg-white/60 rounded-md text-orange-700">{zones.full} Đã đủ</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-100 via-pink-100 to-purple-100 border border-white/60 shadow-sm relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 p-4 opacity-20 hidden sm:block">
                        <UsersRound className="h-14 w-14 text-blue-900" strokeWidth={1.5} />
                    </div>
                    <div className="relative z-10">
                        <div className="h-10 w-10 rounded-2xl bg-white/70 shadow-sm flex items-center justify-center text-blue-700 mb-4">
                            <UsersRound className="h-5 w-5" />
                        </div>
                        <p className="text-4xl font-extrabold text-gray-900 tracking-tight">{groups.active.toLocaleString()}</p>
                        <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-wider">Nhóm đã tạo</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="px-2 py-1 bg-white/60 rounded-md text-blue-700">{groups.total} Tổng cộng</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-100 via-red-100 to-rose-100 border border-white/60 shadow-sm relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 p-4 opacity-20 hidden sm:block">
                        <AlertTriangle className="h-14 w-14 text-orange-900" strokeWidth={1.5} />
                    </div>
                    <div className="relative z-10">
                        <div className="h-10 w-10 rounded-2xl bg-white/70 shadow-sm flex items-center justify-center text-orange-700 mb-4">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <p className="text-4xl font-extrabold text-gray-900 tracking-tight">{reports.open}</p>
                        <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-wider">Báo cáo chờ xử lý</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="px-2 py-1 bg-white/60 rounded-md text-rose-700">{reports.total} Tổng cộng</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* User Registration Chart */}
                <div className="lg:col-span-2 p-6 xl:p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm flex flex-col min-h-[420px]">
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

            {/* Activity Bar Chart */}
            <div className="p-6 xl:p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm flex flex-col min-h-[420px]">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Mật độ Chat theo giờ (Peak Hours)</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">Lượng tin nhắn trong 7 ngày gần nhất hiển thị theo phân bổ khung giờ 24h</p>
                    </div>
                </div>

                <div className="flex-1 w-full relative">
                    {isActivityChartLoading ? (
                        <div className="absolute inset-0 flex justify-center items-center"><Loader2 className="animate-spin h-6 w-6 text-gray-400" /></div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityChart?.data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} />
                                <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="4 4" />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                                />
                                <Bar dataKey="count" name="Tin nhắn đã gửi" fill="#a855f7" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};
