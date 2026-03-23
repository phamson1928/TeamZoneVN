import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Trash2,
  X,
  Loader2,
  Users,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { toast } from 'sonner';
import { groupApi } from '../lib/api';
import { apiClient } from '../lib/axios';
import { StaggerContainer, StaggerItem } from '../components/layout/PageTransition';
import { AppleModal } from '../components/common/AppleModal';
import { AlertTriangle } from 'lucide-react';

interface GroupMember {
  id: string;
  username: string;
  avatarUrl?: string;
}

interface GroupZone {
  id: string;
  title: string;
  status: string;
}

interface GroupGame {
  id: string;
  name: string;
  iconUrl?: string;
}

interface AppGroup {
  id: string;
  isActive: boolean;
  createdAt: string;
  zone: GroupZone;
  leader: GroupMember;
  game: GroupGame;
  _count: {
    members: number;
    messages: number;
  };
}

interface GroupsResponse {
  data: AppGroup[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}



export default function GroupManagement() {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; groupId: string | null }>({ open: false, groupId: null });
  const [inspectingGroup, setInspectingGroup] = useState<AppGroup | null>(null);

  const COLORS = ['#3b82f6', '#ec4899', '#eab308', '#10b981', '#8b5cf6', '#f97316'];
  
  // Charts
  const { data: pieChart } = useQuery({
    queryKey: ['dashboard-groups-chart'],
    queryFn: async () => {
      const payload: any = await apiClient.get('/dashboard/charts/zones');
      const raw: { gameName: string; count: number }[] = payload?.data || [];
      return raw.map((item, i) => ({
        name: item.gameName,
        value: item.count,
        color: COLORS[i % COLORS.length],
      }));
    }
  });

  // Groups
  const { data: groupsData, isLoading } = useQuery<GroupsResponse>({
    queryKey: ['groups', page, limit, searchQuery],
    queryFn: async () => {
      const params: any = { page: page.toString(), limit: limit.toString() };
      if (searchQuery.trim()) params.query = searchQuery.trim();
      
      return await groupApi.getAll(params);
    },
  });

  // Messages
  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['group-messages', inspectingGroup?.id],
    queryFn: async () => {
      if (!inspectingGroup) return [];
      const payload: any = await groupApi.getMessages(inspectingGroup.id);
      return payload?.data || [];
    },
    enabled: !!inspectingGroup
  });

  const deleteMsgMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/messages/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-messages'] });
      toast.success('Đã xóa tin nhắn thành công');
    },
    onError: () => toast.error('Lỗi khi xóa tin nhắn')
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => groupApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Đã giải tán nhóm');
      setConfirmDialog({ open: false, groupId: null });
    },
    onError: () => toast.error('Lỗi khi giải tán nhóm')
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý Nhóm</h1>
      </div>

      <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StaggerItem className="lg:col-span-1 bg-white/70 backdrop-blur-3xl rounded-[32px] border border-white/40 shadow-sm p-8">
           <h3 className="font-bold flex items-center gap-2 mb-6"><PieChartIcon className="w-5 h-5" strokeWidth={3} /> Tỷ lệ theo Game</h3>
           <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={pieChart || []} innerRadius={60} outerRadius={80} dataKey="value">
                       {pieChart?.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
           </div>
        </StaggerItem>

        <StaggerItem className="lg:col-span-2 rounded-[32px] p-8 bg-black text-white relative flex flex-col justify-center overflow-hidden">
           <Users className="absolute right-0 bottom-0 opacity-10 w-64 h-64 -mb-10 -mr-10" />
           <p className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest mb-4">● Live Data</p>
           <h2 className="text-4xl font-black mb-2">Group Monitor</h2>
           <p className="text-gray-400">Hệ thống giám sát nhóm và nội dung chat thời gian thực.</p>
        </StaggerItem>
      </StaggerContainer>

      <StaggerContainer className="w-full" delayOrder={0.15}>
      <StaggerItem className="bg-white/80 backdrop-blur-3xl rounded-[32px] border border-white/40 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex gap-4">
           <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm tiêu đề zone hoặc leader..." 
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-[14px] focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        {isLoading ? (
           <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>
        ) : (
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-gray-100">
                       <th className="px-6 py-4">Nhóm / Zone</th>
                       <th className="px-6 py-4">Leader</th>
                       <th className="px-6 py-4">Thành viên</th>
                       <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {groupsData?.data?.map((group: any) => (
                       <tr key={group.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 py-4 font-bold text-gray-900">{group.zone?.title}</td>
                          <td className="px-6 py-4 text-sm font-medium">{group.leader?.username}</td>
                          <td className="px-6 py-4 text-sm font-bold">{group._count.members} / 5</td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                 <button onClick={() => setInspectingGroup(group)} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-[10px] text-xs font-bold transition-all active:scale-95">Inspect</button>
                                 <button onClick={() => setConfirmDialog({ open: true, groupId: group.id })} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-[10px] transition-all active:scale-95"><Trash2 className="w-4 h-4" /></button>
                              </div>
                           </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}
      </StaggerItem>
      </StaggerContainer>

      <AppleModal
         isOpen={!!inspectingGroup}
         onClose={() => setInspectingGroup(null)}
         width="2xl"
      >
         {inspectingGroup && (
           <>
               <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50">
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Group Monitor</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Zone: {inspectingGroup.zone?.title}</p>
                  </div>
                  <button onClick={() => setInspectingGroup(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-90"><X className="w-6 h-6 text-gray-400" /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gray-50 max-h-[60vh]">
                  {isMessagesLoading ? (
                     <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>
                  ) : (messages && Array.isArray(messages)) ? messages.map((msg: any) => (
                     <div key={msg.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold">{msg.sender?.username?.charAt(0)}</div>
                        <div className="max-w-[80%]">
                           <p className="text-[10px] font-bold text-gray-400 mb-1">{msg.sender?.username}</p>
                           <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 text-sm shadow-sm relative group">
                              {msg.isDeleted ? "[Admin deleted content]" : msg.content}
                              {!msg.isDeleted && (
                                 <button 
                                   onClick={() => { if(confirm('Xóa tin nhắn này?')) deleteMsgMutation.mutate(msg.id); }}
                                   className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-rose-500"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              )}
                           </div>
                        </div>
                     </div>
                  )) : (
                     <div className="h-full flex items-center justify-center text-gray-400">Không có tin nhắn nào.</div>
                  )}
               </div>
               <div className="p-8 border-t border-gray-100 bg-gray-50/50">
                  <button onClick={() => setInspectingGroup(null)} className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-[18px] font-bold transition-all active:scale-95 shadow-xl shadow-black/10 text-sm">Thoát trình giám sát</button>
               </div>
           </>
         )}
      </AppleModal>

      <AppleModal
         isOpen={confirmDialog.open}
         onClose={() => setConfirmDialog({ open: false, groupId: null })}
         width="md"
      >
         <div className="p-8">
             <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-rose-50 text-rose-500">
                <AlertTriangle className="w-7 h-7" />
             </div>
             <div className="text-center space-y-2 mb-8">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Giải tán nhóm?</h3>
                <p className="text-sm font-medium text-gray-500 leading-relaxed">Hành động này sẽ xóa hoàn toàn nhóm và cuộc hội thoại hiện tại.</p>
             </div>
             <div className="flex gap-3">
                <button onClick={() => setConfirmDialog({ open: false, groupId: null })} className="flex-1 py-3.5 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[18px] transition-all active:scale-95">Hủy</button>
                <button onClick={() => { if(confirmDialog.groupId) deleteGroupMutation.mutate(confirmDialog.groupId); }} className="flex-1 py-3.5 bg-rose-600 text-white rounded-[18px] font-bold shadow-xl shadow-rose-500/25 transition-all active:scale-95">Giải tán</button>
             </div>
         </div>
      </AppleModal>
    </div>
  );
}
