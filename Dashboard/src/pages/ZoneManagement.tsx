import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Gamepad2,
  PieChart as PieChartIcon,
  TrendingUp,
  Award,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { toast } from 'sonner';
import { zoneApi } from '../lib/api';
import { StaggerContainer, StaggerItem } from '../components/layout/PageTransition';
import { AppleModal } from '../components/common/AppleModal';

interface Zone {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'FULL' | 'CLOSED';
  requiredPlayers: number;
  minRankLevel: string;
  maxRankLevel: string;
  createdAt: string;
  owner: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  game: {
    id: string;
    name: string;
    iconUrl?: string;
  };
  _count: {
    joinRequests: number;
  };
}

interface ZonesResponse {
  data: Zone[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function ZoneManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLive, setIsLive] = useState(false);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'close' | 'delete' | null;
    zoneId: string | null;
  }>({ open: false, action: null, zoneId: null });

  const COLORS = ['#3b82f6', '#ec4899', '#eab308', '#10b981', '#8b5cf6', '#f97316'];
  
  const { data: zonesChart } = useQuery({
    queryKey: ['dashboard-zones-chart'],
    queryFn: async () => {
      const { apiClient } = await import('../lib/axios');
      // Interceptor unpacks: { success, data: { data: [...] } } → { data: [...] }
      const payload: any = await apiClient.get('/dashboard/charts/zones');
      const raw: { gameName: string; count: number }[] = payload?.data || [];
      return raw.map((item, i) => ({
        name: item.gameName,
        value: item.count,
        color: COLORS[i % COLORS.length],
      }));
    }
  });

  const { data: engagementChart } = useQuery({
    queryKey: ['dashboard-engagement-chart'],
    queryFn: async () => {
      const { apiClient } = await import('../lib/axios');
      try {
        // Interceptor unpacks { success, data: { data: [...] } } → { data: [...] }
        const payload: any = await apiClient.get('/dashboard/charts/engagement');
        return payload?.data || [];
      } catch (e) {
        return [];
      }
    }
  });

  const { data: topGamesChart } = useQuery({
    queryKey: ['dashboard-top-games-chart'],
    queryFn: async () => {
      const { apiClient } = await import('../lib/axios');
      try {
        // Interceptor unpacks { success, data: { data: [...] } } → { data: [...] }
        const payload: any = await apiClient.get('/dashboard/charts/top-games');
        return payload?.data || [];
      } catch (e) {
        return [];
      }
    }
  });

  const { data: zonesData, isLoading } = useQuery<ZonesResponse>({
    queryKey: ['zones', page, limit, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchQuery) params.append('query', searchQuery);
      // GET /zones/admin returns { data: [...], meta: {} } (no success wrapper) → interceptor returns as-is
      return await zoneApi.getAll(Object.fromEntries(params.entries()));
    },
    refetchInterval: isLive ? 3000 : false,
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => zoneApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast.success('Đã đóng Zone thành công');
      setConfirmDialog({ open: false, action: null, zoneId: null });
    },
    onError: () => toast.error('Không thể đóng Zone'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => zoneApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast.success('Đã xóa Zone rác thành công');
      setConfirmDialog({ open: false, action: null, zoneId: null });
    },
    onError: () => toast.error('Không thể xóa Zone'),
  });

  const confirmAction = () => {
    if (!confirmDialog.zoneId) return;
    if (confirmDialog.action === 'close') closeMutation.mutate(confirmDialog.zoneId);
    if (confirmDialog.action === 'delete') deleteMutation.mutate(confirmDialog.zoneId);
  };

  const handleExport = () => {
    if (!zonesData?.data || zonesData.data.length === 0) {
      toast.error('Không có dữ liệu để xuất');
      return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const headers = ["ID", "Tiêu đề", "Trạng thái", "Trò chơi", "Người tạo", "Người đăng ký", "Giới hạn"];
    const rows = zonesData.data.map(z => [
        `="${z.id}"`, 
        `"${z.title.replace(/"/g, '""')}"`,
        z.status,
        `"${(z.game?.name || 'Unknown').replace(/"/g, '""')}"`,
        `"${(z.owner?.username || 'Unknown').replace(/"/g, '""')}"`,
        z._count?.joinRequests ?? 0,
        z.requiredPlayers
    ]);

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zones_export_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Dữ liệu Zone đã được tải xuống.');
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto auto-rows-max">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Quản lý Zone</h1>
          <p className="text-gray-500 mt-2 font-medium">Giám sát bài đăng tìm bạn và phòng voice chat</p>
        </div>
        <div className="flex bg-white/50 p-1 rounded-2xl border border-gray-200/60 shadow-sm backdrop-blur-xl">
           <button 
             onClick={() => setIsLive(!isLive)}
             className={`px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 ${isLive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
           >
             {isLive && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
             Live Data
           </button>
           <button 
             onClick={handleExport}
             className="px-5 py-2 text-gray-500 hover:text-gray-900 hover:bg-white/80 rounded-xl text-sm font-bold transition-all active:scale-95"
           >
             Export
           </button>
        </div>
      </div>

      <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StaggerItem className="lg:col-span-1 bg-white/70 backdrop-blur-3xl rounded-[32px] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
           
           <div className="relative z-10 flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-gray-400" />
                Phân bố Game 
              </h3>
           </div>
           
           <div className="flex-1 w-full flex items-center justify-center relative z-10">
             <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={zonesChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {zonesChart?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 10px 40px -10px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', padding: '12px 16px', fontWeight: 600 }}
                     itemStyle={{ color: '#111827', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </StaggerItem>

        <StaggerItem className="lg:col-span-2 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 relative overflow-hidden flex flex-col justify-center border border-white/60 bg-gradient-to-br from-zinc-900 to-black">
            <div className="absolute top-0 right-0 p-8 opacity-20 blur-[1px] pointer-events-none transform translate-x-4 -translate-y-4">
              <Gamepad2 className="w-64 h-64 text-white" strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-white/90 backdrop-blur-xl mb-6 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Active Zone Monitor</h2>
              <p className="text-zinc-400 text-base max-w-lg leading-relaxed font-medium">
                 Tất cả bài phân tích và nhóm chơi game hiển thị realtime. Điều phối phòng, khóa vi phạm và xóa phòng trống chỉ bằng 1 click.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                 <div className="bg-white/5 hover:bg-white/10 transition-colors duration-300 backdrop-blur-2xl rounded-[20px] p-5 border border-white/5 group">
                    <p className="text-sm text-zinc-400 font-medium mb-1">Đang Active</p>
                    <p className="text-3xl font-extrabold text-white group-hover:scale-105 transition-transform origin-left">{zonesData?.meta?.total || 0}</p>
                 </div>
              </div>
            </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Analytics Row */}
      <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6" delayOrder={0.15}>
        {/* Engagement Chart */}
        <StaggerItem className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-extrabold text-gray-900 text-xl flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  Mức độ tương tác
                </h3>
                <p className="text-sm border-gray-500 font-medium text-gray-400 mt-1">Lượng Zones & Groups mới theo ngày</p>
              </div>
           </div>
           
           <div className="w-full h-[280px]">
             {engagementChart?.length ? (
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorZones" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGroups" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 10px 40px -10px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', padding: '12px 16px' }}
                      itemStyle={{ fontWeight: 700 }}
                      labelStyle={{ color: '#6b7280', fontWeight: 600, marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="zones" name="Zones" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorZones)" activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }} />
                    <Area type="monotone" dataKey="groups" name="Groups" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorGroups)" activeDot={{ r: 6, strokeWidth: 0, fill: '#ec4899' }} />
                  </AreaChart>
               </ResponsiveContainer>
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                 <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
                 <p className="text-sm font-medium">Chưa có dữ liệu tương tác</p>
               </div>
             )}
           </div>
        </StaggerItem>

        {/* Top Games Chart */}
        <StaggerItem className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-extrabold text-gray-900 text-xl flex items-center gap-2.5">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                  Top 10 Games thịnh hành
                </h3>
                <p className="text-sm border-gray-500 font-medium text-gray-400 mt-1">Dựa trên số lượng tương tác hệ thống</p>
              </div>
           </div>
           
           <div className="w-full h-[280px]">
             {topGamesChart?.length ? (
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topGamesChart} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 600 }} 
                      interval={0}
                      angle={-40}
                      textAnchor="end"
                      height={80}
                      dx={0}
                      dy={10}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }} />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 10px 40px -10px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', padding: '12px 16px' }}
                      itemStyle={{ fontWeight: 700, color: '#f43f5e' }}
                      labelStyle={{ color: '#6b7280', fontWeight: 600, marginBottom: '4px' }}
                    />
                    <Bar dataKey="zones" name="Lượt mở Zone" fill="#f43f5e" radius={[6, 6, 6, 6]} barSize={32} />
                  </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                 <Award className="w-8 h-8 mb-2 opacity-20" />
                 <p className="text-sm font-medium">Chưa có dữ liệu Top Games</p>
               </div>
             )}
           </div>
        </StaggerItem>
      </StaggerContainer>

      <StaggerContainer className="w-full" delayOrder={0.25}>
      <StaggerItem className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200/50 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white/40">
          <div className="relative w-full sm:w-[320px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search zones, titles, owners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-[14px] focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : !zonesData?.data?.length ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
             <MapPin className="w-12 h-12 mb-4 opacity-20" />
             <p>Không có dữ liệu Zone</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left align-middle border-collapse">
               <thead className="bg-[#fcfcfc] text-gray-400 font-medium border-b border-gray-100/80">
                 <tr>
                    <th className="px-6 py-5 font-medium tracking-wide">About</th>
                    <th className="px-6 py-5 font-medium tracking-wide">Tạo bởi</th>
                    <th className="px-6 py-5 font-medium tracking-wide">Trò chơi</th>
                    <th className="px-6 py-5 font-medium tracking-wide">Tiến độ</th>
                    <th className="px-6 py-5 text-right font-medium tracking-wide">Hành động</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100/80">
                 {zonesData.data.map((zone) => (
                    <tr key={zone.id} className="hover:bg-gray-50/40 transition-colors group">
                       <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900 line-clamp-1">{zone.title}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-[200px]">{zone.description}</p>
                       </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            {zone.owner?.avatarUrl ? (
                              <img src={zone.owner.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-gray-100 object-cover shadow-sm" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-semibold border border-gray-200">
                                {zone.owner?.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">{zone.owner?.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="inline-flex items-center px-3 py-1.5 bg-gray-50 rounded-xl text-[13px] font-semibold text-gray-700 border border-gray-200/60 shadow-sm whitespace-nowrap">
                             <span>{zone.game?.name || <span className="text-gray-400 italic font-medium">Unknown</span>}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                                zone.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                zone.status === 'FULL' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}>
                                {zone.status}
                              </span>
                              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{zone._count?.joinRequests ?? 0}/{zone.requiredPlayers}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                             {zone.status !== 'CLOSED' && (
                               <button onClick={() => setConfirmDialog({ open: true, action: 'close', zoneId: zone.id })} className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50/80 rounded-[10px] transition-all active:scale-95" title="Khóa Zone">
                                 <Lock className="w-4 h-4" />
                               </button>
                             )}
                             <button onClick={() => setConfirmDialog({ open: true, action: 'delete', zoneId: zone.id })} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-[10px] transition-all active:scale-95" title="Xóa Vĩnh Viễn">
                                 <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        </td>
                     </tr>
                 ))}
               </tbody>
             </table>
             
             {zonesData?.meta && zonesData.meta.totalPages > 1 && (
               <div className="p-6 flex items-center justify-between text-sm text-gray-500 font-medium bg-gray-50/30 border-t border-gray-100">
                 <div>Trang {page} / {zonesData.meta.totalPages} ({zonesData.meta.total} zones)</div>
                 <div className="flex items-center gap-1 p-1 bg-white border border-gray-100 rounded-[14px] shadow-sm">
                   <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent rounded-[10px] transition-all active:scale-95">
                     <ChevronLeft className="w-4 h-4" />
                   </button>
                   <div className="w-[1px] h-4 bg-gray-100 mx-1" />
                   <button onClick={() => setPage(p => Math.min(zonesData.meta?.totalPages || 1, p + 1))} disabled={page === (zonesData.meta?.totalPages || 1)} className="p-2 hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent rounded-[10px] transition-all active:scale-95">
                     <ChevronRight className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             )}
          </div>
        )}
      </StaggerItem>
      </StaggerContainer>

      <AppleModal
         isOpen={confirmDialog.open}
         onClose={() => setConfirmDialog({ open: false, action: null, zoneId: null })}
         width="sm"
      >
        <div className={`h-1.5 ${confirmDialog.action === 'delete' ? 'bg-gradient-to-r from-red-500 to-rose-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'}`} />
        <div className="p-8">
          <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${confirmDialog.action === 'delete' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
             {confirmDialog.action === 'delete' ? <Trash2 className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Xác nhận {confirmDialog.action === 'delete' ? 'Xóa' : 'Đóng'} Zone</h3>
            <p className="text-sm font-medium text-gray-500 leading-relaxed">Bạn có chắc chắn muốn thực hiện hành động này? Điều này không thể hoàn tác.</p>
          </div>
          
          <div className="flex gap-3">
             <button onClick={() => setConfirmDialog({ open: false, action: null, zoneId: null })} className="flex-1 px-4 py-3.5 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[18px] transition-all active:scale-95">Hủy</button>
             <button onClick={confirmAction} className={`flex-1 px-4 py-3.5 font-bold text-white shadow-xl rounded-[18px] transition-all active:scale-95 ${confirmDialog.action === 'delete' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'}`}>Xác nhận</button>
          </div>
        </div>
      </AppleModal>
    </div>
  );
}
