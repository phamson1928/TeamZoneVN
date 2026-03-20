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
      const chartRes = await apiClient.get('/dashboard/charts/zones');
      const raw: { gameName: string; count: number }[] = chartRes.data?.data?.data || [];
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
      
      const response = await groupApi.getAll(params);
      return response.data?.success ? response.data.data : response.data;
    },
  });

  // Messages
  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['group-messages', inspectingGroup?.id],
    queryFn: async () => {
      if (!inspectingGroup) return [];
      const res = await groupApi.getMessages(inspectingGroup.id);
      // Backend: { success: true, data: { data: [], meta: {} } }
      const payload = res.data?.success ? res.data.data : res.data;
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white/70 backdrop-blur-3xl rounded-[32px] border border-white/40 shadow-sm p-8">
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
        </div>

        <div className="lg:col-span-2 rounded-[32px] p-8 bg-black text-white relative flex flex-col justify-center overflow-hidden">
           <Users className="absolute right-0 bottom-0 opacity-10 w-64 h-64 -mb-10 -mr-10" />
           <p className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest mb-4">● Live Data</p>
           <h2 className="text-4xl font-black mb-2">Group Monitor</h2>
           <p className="text-gray-400">Hệ thống giám sát nhóm và nội dung chat thời gian thực.</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-3xl rounded-[32px] border border-white/40 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm tiêu đề zone hoặc leader..." 
                className="w-full pl-11 pr-4 py-2 bg-gray-50 border-none rounded-xl"
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
                    {groupsData?.data.map((group) => (
                       <tr key={group.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 py-4 font-bold text-gray-900">{group.zone?.title}</td>
                          <td className="px-6 py-4 text-sm font-medium">{group.leader?.username}</td>
                          <td className="px-6 py-4 text-sm font-bold">{group._count.members} / 5</td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2">
                                <button onClick={() => setInspectingGroup(group)} className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100">Inspect Chat</button>
                                <button onClick={() => setConfirmDialog({ open: true, groupId: group.id })} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}
      </div>

      {inspectingGroup && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden animate-in zoom-in">
               <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black">Group Chat Monitor</h3>
                    <p className="text-xs text-gray-400 mt-1">{inspectingGroup.zone?.title}</p>
                  </div>
                  <button onClick={() => setInspectingGroup(null)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gray-50">
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
               <div className="p-8 bg-white border-t border-gray-100">
                  <button onClick={() => setInspectingGroup(null)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold">Thoát trình giám sát</button>
               </div>
            </div>
         </div>
      )}

      {confirmDialog.open && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
            <div className="bg-white p-8 rounded-[32px] max-w-md w-full shadow-2xl animate-in zoom-in">
               <h3 className="text-xl font-black mb-4">Giải tán nhóm?</h3>
               <p className="text-gray-500 mb-8">Hành động này sẽ xóa hoàn toàn nhóm và cuộc hội thoại hiện tại.</p>
               <div className="flex gap-4">
                  <button onClick={() => setConfirmDialog({ open: false, groupId: null })} className="flex-1 py-3 bg-gray-100 rounded-2xl font-bold">Hủy</button>
                  <button onClick={() => { if(confirmDialog.groupId) deleteGroupMutation.mutate(confirmDialog.groupId); }} className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-bold">Giải tán</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
