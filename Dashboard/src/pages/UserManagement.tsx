import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Ban, 
  Trash2,
  TrendingUp,
  Eye,
  X,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Activity,
  Heart,
  Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { userApi } from '../lib/api';
import { cn } from '../lib/utils';
import { CustomDropdown } from '../components/common/CustomDropdown';
import { StaggerContainer, StaggerItem } from '../components/layout/PageTransition';
import { AppleModal } from '../components/common/AppleModal';

interface DashboardUser {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED';
  createdAt: string;
  profile?: {
    bio?: string;
    playStyle?: string;
    timezone?: string;
    lastActiveAt?: string;
  };
}

interface UsersResponse {
  data: DashboardUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'ban' | 'unban' | 'delete' | null;
    userId: string | null;
  }>({ open: false, action: null, userId: null });
  
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);

  const { data: usersChart } = useQuery({
    queryKey: ['dashboard-users-chart-mgmt'],
    queryFn: async () => {
      // Interceptor unpacks { success, data: { period, data: [...] } } → { period, data: [...] }
      const payload: any = await userApi.get('/dashboard/charts/users?period=30d');
      return payload?.data || [];
    }
  });

  const { data: usersData, isLoading } = useQuery<UsersResponse>({
    queryKey: ['users', page, limit, searchQuery, roleFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchQuery) params.append('query', searchQuery);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      
      const endpoint = searchQuery || roleFilter || statusFilter 
        ? `/users/search?${params}` 
        : `/users?${params}`;
      
      return await userApi.get(endpoint);
    },
  });

  const { data: userDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['user-details', selectedUser?.id],
    queryFn: async () => {
       if (!selectedUser?.id) return null;
       return await userApi.get(`/users/${selectedUser.id}`);
    },
    enabled: !!selectedUser?.id
  });

  const banMutation = useMutation({
    mutationFn: (userId: string) => userApi.patch(`/users/${userId}/ban`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Đã cấm người dùng');
      setConfirmDialog({ open: false, action: null, userId: null });
    },
    onError: () => toast.error('Lỗi khi cấm người dùng'),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => userApi.delete(`/users/${userId}/delete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Đã xóa người dùng');
      setConfirmDialog({ open: false, action: null, userId: null });
    },
    onError: () => toast.error('Lỗi khi xóa người dùng'),
  });

  const confirmAction = () => {
    if (!confirmDialog.userId) return;
    if (confirmDialog.action === 'ban') banMutation.mutate(confirmDialog.userId);
    if (confirmDialog.action === 'delete') deleteMutation.mutate(confirmDialog.userId);
  };

  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const limitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (limitRef.current && !limitRef.current.contains(event.target as Node)) setIsLimitOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý người dùng</h1>
      </div>

      <StaggerContainer className="space-y-8">
      <StaggerItem className="bg-white/70 backdrop-blur-3xl rounded-[32px] border border-white/60 shadow-sm p-8">
        <div className="relative z-10 mb-8 flex items-center justify-between">
            <h3 className="text-2xl font-extrabold">User Growth</h3>
            <TrendingUp className="h-6 w-6 text-indigo-500" />
        </div>
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usersChart || []}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <RechartsTooltip />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fill="#6366f120" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </StaggerItem>

      <StaggerItem className="relative z-20 bg-white/70 backdrop-blur-2xl rounded-[24px] shadow-sm border border-white/60 p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-[14px] focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <CustomDropdown 
            options={[
              { value: '', label: 'Tất cả vai trò' }, 
              { value: 'USER', label: 'Người dùng' }, 
              { value: 'ADMIN', label: 'Quản trị' }
            ]} 
            value={roleFilter} 
            onChange={(val) => { setRoleFilter(val); setPage(1); }} 
            placeholder="Vai trò" 
            icon={<Filter className="w-4 h-4" />} 
          />
          <CustomDropdown 
            options={[
              { value: '', label: 'Tất cả trạng thái' }, 
              { value: 'ACTIVE', label: 'Hoạt động' }, 
              { value: 'BANNED', label: 'Đã cấm' }
            ]} 
            value={statusFilter} 
            onChange={(val) => { setStatusFilter(val); setPage(1); }} 
            placeholder="Trạng thái" 
            icon={<Filter className="w-4 h-4" />} 
          />
          <button onClick={() => { setSearchQuery(''); setRoleFilter(''); setStatusFilter(''); setPage(1); }} className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-[14px] text-gray-600 font-bold transition-all active:scale-95">Xóa bộ lọc</button>
        </div>
      </StaggerItem>

      <StaggerItem className="relative z-10 bg-white/80 backdrop-blur-3xl rounded-[32px] border border-white/40 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-gray-100">
                    <th className="px-6 py-4">Người dùng</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersData?.data.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">{user.username.charAt(0)}</div>
                          <div>
                            <p onClick={() => setSelectedUser(user)} className="font-bold cursor-pointer hover:text-indigo-600 transition-colors">{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                            <button onClick={() => setSelectedUser(user)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-[10px] transition-all active:scale-95" title="Xem chi tiết"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => setConfirmDialog({ open: true, action: 'ban', userId: user.id })} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50/80 rounded-[10px] transition-all active:scale-95" title="Cấm người dùng"><Ban className="w-4 h-4" /></button>
                            <button onClick={() => setConfirmDialog({ open: true, action: 'delete', userId: user.id })} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-[10px] transition-all active:scale-95" title="Xóa người dùng"><Trash2 className="w-4 h-4" /></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {usersData?.meta && usersData.meta.totalPages > 0 && (
              <div className="p-6 flex items-center justify-between bg-white/40 border-t border-gray-100/60 backdrop-blur-md">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 border border-white/80 rounded-2xl shadow-sm">
                    <span className="text-xs font-bold text-gray-400">Trang</span>
                    <span className="text-sm font-black text-gray-900">{page}</span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className="text-sm font-black text-gray-500">{usersData.meta.totalPages}</span>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/60 border border-white/80 rounded-2xl shadow-sm relative group" ref={limitRef}>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Hiển thị</span>
                    <button 
                      onClick={() => setIsLimitOpen(!isLimitOpen)} 
                      className="flex items-center gap-1 text-sm font-black text-indigo-600 transition-transform active:scale-95"
                    >
                      {limit}
                      <ChevronDown className={cn("w-3.5 h-3.5 text-indigo-400 transition-transform duration-200", isLimitOpen && "rotate-180")} />
                    </button>

                    {isLimitOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-20 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in">
                        {[10, 20, 50, 100].map(v => (
                          <button 
                            key={v} 
                            onClick={() => { setLimit(v); setPage(1); setIsLimitOpen(false); }}
                            className={cn(
                              "w-full px-4 py-2.5 text-left text-sm font-bold transition-colors",
                              limit === v ? "bg-indigo-600 text-white" : "hover:bg-indigo-50 text-gray-600"
                            )}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-xs font-bold text-gray-400">
                    Tổng <span className="text-gray-900">{usersData.meta.total}</span> người dùng
                  </div>
                </div>

                <div className="flex items-center gap-1 p-1 bg-white border border-gray-100 rounded-[14px] shadow-sm">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1} 
                    className="p-2 hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent rounded-[10px] transition-all active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="w-[1px] h-4 bg-gray-100 mx-1" />
                  <button 
                    onClick={() => setPage(p => Math.min(usersData.meta.totalPages, p + 1))} 
                    disabled={page === usersData.meta.totalPages} 
                    className="p-2 hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent rounded-[10px] transition-all active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </StaggerItem>
      </StaggerContainer>

      <AppleModal
         isOpen={confirmDialog.open}
         onClose={() => setConfirmDialog({ open: false, action: null, userId: null })}
         width="sm"
      >
         <div className="p-8">
             <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-rose-50 text-rose-500">
                <AlertTriangle className="w-7 h-7" />
             </div>
             <div className="text-center space-y-2 mb-8">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Xác nhận thao tác</h3>
                <p className="text-sm font-medium text-gray-500 leading-relaxed">Bạn có chắc chắn muốn {confirmDialog.action} người dùng này?</p>
             </div>
             <div className="flex gap-3">
                <button onClick={() => setConfirmDialog({ open: false, action: null, userId: null })} className="flex-1 py-3.5 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[18px] transition-all active:scale-95">Hủy</button>
                <button onClick={confirmAction} className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-[18px] font-bold shadow-xl shadow-rose-500/25 transition-all active:scale-95">Xác nhận</button>
             </div>
         </div>
      </AppleModal>

      <AppleModal
         isOpen={!!selectedUser}
         onClose={() => setSelectedUser(null)}
         width="lg"
      >
         {selectedUser && (
           <>
             <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/50">
                <h3 className="text-xl font-black tracking-tight">Thông tin người dùng</h3>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-90"><X className="w-6 h-6 text-gray-400" /></button>
             </div>
              <div className="p-8 space-y-8">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-indigo-100">{selectedUser.username.charAt(0)}</div>
                    <div>
                       <h4 className="text-2xl font-black leading-tight flex items-center gap-3">
                         {selectedUser.username}
                         <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${selectedUser.role === 'ADMIN' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                           {selectedUser.role}
                         </span>
                       </h4>
                       <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ngày tham gia: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                 </div>

                 <div className="bg-gray-50/80 p-6 rounded-[28px] italic text-sm text-gray-600 border border-gray-100 leading-relaxed relative">
                    <div className="absolute top-4 left-4 text-gray-300 font-serif text-4xl">"</div>
                    <p className="indent-6">{selectedUser.profile?.bio || 'Chưa cập nhật tiểu sử'}</p>
                 </div>

                 {/* Hoạt động & Thống kê */}
                 <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                       <Activity className="w-4 h-4 text-gray-400" />
                       Hoạt động
                    </h4>
                    
                    {detailsLoading ? (
                       <div className="p-6 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>
                    ) : (
                       <div className="grid grid-cols-2 gap-4">
                           <div className="p-5 bg-white border border-gray-100 rounded-[20px] shadow-sm flex items-center gap-4">
                              <div className="p-3 bg-rose-50 rounded-xl text-rose-500">
                                 <Heart className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Số lượt thích</p>
                                 <p className="text-xl font-black text-gray-900 leading-none mt-1">{userDetails?.likeCount || 0}</p>
                              </div>
                           </div>
                           
                           <div className="p-5 bg-white border border-gray-100 rounded-[20px] shadow-sm flex items-center gap-4">
                              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
                                 <Clock className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Lần cuối hoạt động</p>
                                 <p className="text-sm font-bold text-gray-900 leading-none mt-1">{userDetails?.profile?.lastActiveAt ? new Date(userDetails.profile.lastActiveAt).toLocaleDateString() : 'Không rõ'}</p>
                              </div>
                           </div>
                       </div>
                    )}
                 </div>
              </div>
             <div className="p-8 border-t border-gray-100 bg-gray-50/50">
                <button onClick={() => setSelectedUser(null)} className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-[18px] font-bold transition-all active:scale-95 shadow-xl shadow-black/10 text-sm">Đóng cửa sổ</button>
             </div>
           </>
         )}
      </AppleModal>
    </div>
  );
}
