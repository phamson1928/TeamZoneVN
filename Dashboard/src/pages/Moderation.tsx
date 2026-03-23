import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Filter,
  User,
  Eye,
  AlertTriangle,
  Send,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { reportApi, messageApi, tagApi } from '../lib/api';
import { StaggerContainer, StaggerItem } from '../components/layout/PageTransition';
import { AppleModal } from '../components/common/AppleModal';

interface Tag {
  id: string;
  name: string;
}

interface Report {
  id: string;
  type: string;
  targetId: string;
  reason: string;
  description: string;
  status: 'OPEN' | 'RESOLVED';
  resolutionNote?: string;
  createdAt: string;
  reporter: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  targetUser?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

interface Message {
  id: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  group: {
    id: string;
    zone: {
      title: string;
    };
  };
}

export default function Moderation() {
  const queryClient = useQueryClient();
  const [activeTab, setTab] = useState<'reports' | 'messages' | 'tags'>('reports');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const limitRef = useRef<HTMLDivElement>(null);
  
  const [filter, setFilter] = useState<'OPEN' | 'RESOLVED' | 'ALL'>('OPEN');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  // Tag modal states
  const [editTagModal, setEditTagModal] = useState<{ open: boolean; tag: Tag | null }>({ open: false, tag: null });
  const [deleteTagDialog, setDeleteTagDialog] = useState<{ open: boolean; tagId: string | null }>({ open: false, tagId: null });
  const [tagName, setTagName] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (limitRef.current && !limitRef.current.contains(event.target as Node)) setIsLimitOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetPagination = () => setPage(1);

  // --- Reports Query ---
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports', filter, page, limit],
    queryFn: async () => {
       const params: any = { page, limit };
       if (filter !== 'ALL') params.status = filter;
       return await reportApi.getAll(params);
    },
    enabled: activeTab === 'reports'
  });

  // --- Messages Query ---
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['admin-messages', page, limit, searchQuery],
    queryFn: async () => {
       const params: any = { page, limit };
       if (searchQuery) params.query = searchQuery;
       return await messageApi.getAll(params);
    },
    enabled: activeTab === 'messages'
  });

  // --- Tags Query ---
  const { data: tagsData, isLoading: tagsLoading } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: async () => {
       return await tagApi.getAll();
    },
    enabled: activeTab === 'tags'
  });

  const createTagMutation = useMutation({
    mutationFn: (name: string) => tagApi.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      toast.success('Đã thêm Tag');
      setEditTagModal({ open: false, tag: null });
      setTagName('');
    },
    onError: () => toast.error('Không thể thêm Tag')
  });

  const updateTagMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => tagApi.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      toast.success('Đã cập nhật Tag');
      setEditTagModal({ open: false, tag: null });
      setTagName('');
    },
    onError: () => toast.error('Không thể cập nhật Tag')
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => tagApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      toast.success('Đã xóa Tag');
      setDeleteTagDialog({ open: false, tagId: null });
    },
    onError: () => toast.error('Không thể xóa Tag')
  });

  const handleSaveTag = () => {
     if (!tagName.trim()) {
       toast.error('Tên tag không được để trống');
       return;
     }
     if (editTagModal.tag) {
       updateTagMutation.mutate({ id: editTagModal.tag.id, name: tagName });
     } else {
       createTagMutation.mutate(tagName);
     }
  };

  const resolveMutation = useMutation({
    mutationFn: (id: string) => reportApi.resolve(id, { resolutionNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Đã xử lý báo cáo thành công');
      setSelectedReport(null);
      setResolutionNote('');
    },
    onError: () => toast.error('Không thể xử lý báo cáo')
  });

  const deleteMsgMutation = useMutation({
    mutationFn: (id: string) => messageApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast.success('Đã xóa tin nhắn vi phạm');
    },
    onError: () => toast.error('Không thể xóa tin nhắn')
  });

  const handleResolve = () => {
    if (!selectedReport || !resolutionNote.trim()) {
       toast.error('Vui lòng điền ghi chú xử lý');
       return;
    }
    resolveMutation.mutate(selectedReport.id);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto auto-rows-max">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Kiểm duyệt & Báo cáo</h1>
          <p className="text-gray-500 mt-2 font-medium">Xử lý các hành vi vi phạm và kiểm soát luồng tin nhắn toàn hệ thống</p>
        </div>
        
        <div className="flex bg-white/50 p-1 rounded-2xl border border-gray-200/60 shadow-sm backdrop-blur-xl">
           <button 
             onClick={() => { setTab('reports'); resetPagination(); }}
             className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'text-gray-500 hover:text-gray-900 hover:bg-white/80'}`}
           >
             Báo cáo (Reports)
           </button>
           <button 
             onClick={() => { setTab('messages'); resetPagination(); }}
             className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'messages' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'text-gray-500 hover:text-gray-900 hover:bg-white/80'}`}
           >
             Tin nhắn (Logs)
           </button>
           <button 
             onClick={() => { setTab('tags'); resetPagination(); }}
             className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'tags' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'text-gray-500 hover:text-gray-900 hover:bg-white/80'}`}
           >
             Tags (Từ khóa)
           </button>
        </div>
      </div>

      <StaggerContainer className="flex-1 min-h-[600px] flex flex-col">
      <StaggerItem className="relative z-10 bg-white/80 backdrop-blur-3xl rounded-[40px] border border-white/40 shadow-sm overflow-hidden flex-1 flex flex-col">
        {/* Header toolbar */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm kiếm nội dung..." 
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-[14px] focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); resetPagination(); }}
              />
           </div>
           
           {activeTab === 'reports' && (
             <div className="flex items-center gap-1">
                <Filter className="w-4 h-4 text-gray-400 mr-2" />
                <button onClick={() => { setFilter('OPEN'); resetPagination(); }} className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all active:scale-95 ${filter === 'OPEN' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100/50' : 'bg-transparent text-gray-500 hover:bg-gray-100/80 hover:text-gray-900'}`}>Đang mở</button>
                <button onClick={() => { setFilter('RESOLVED'); resetPagination(); }} className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all active:scale-95 ${filter === 'RESOLVED' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100/50' : 'bg-transparent text-gray-500 hover:bg-gray-100/80 hover:text-gray-900'}`}>Đã xử lý</button>
                <button onClick={() => { setFilter('ALL'); resetPagination(); }} className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all active:scale-95 ${filter === 'ALL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100/50' : 'bg-transparent text-gray-500 hover:bg-gray-100/80 hover:text-gray-900'}`}>Tất cả</button>
             </div>
           )}
           {activeTab === 'tags' && (
              <button 
                onClick={() => { setTagName(''); setEditTagModal({ open: true, tag: null }); }}
                className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-[14px] text-sm font-bold shadow-xl shadow-gray-900/20 transition-all active:scale-95 flex items-center gap-2"
              >
                 Thêm Tag
              </button>
           )}
        </div>

        <div className="flex-1">
          {activeTab === 'reports' ? (
             reportsLoading ? (
               <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left align-middle border-collapse">
                   <thead className="bg-[#fcfcfc] text-gray-400 font-medium border-b border-gray-100/80 uppercase tracking-widest text-[10px]">
                     <tr>
                        <th className="px-8 py-5">Đối tượng</th>
                        <th className="px-8 py-5">Lý do</th>
                        <th className="px-8 py-5">Người báo cáo</th>
                        <th className="px-8 py-5 text-right">Thao tác</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100/80">
                     {reportsData?.items?.map((report: Report) => (
                        <tr key={report.id} className="hover:bg-gray-50/40 transition-colors group/row">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl border ${report.type === 'USER' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
                                   {report.type === 'USER' ? <User className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                </div>
                                <div className="flex flex-col">
                                   <span className="font-bold text-gray-900 uppercase text-[11px] tracking-wide">{report.type}</span>
                                   <span className="text-gray-500 font-medium font-mono text-xs">{report.targetId.split('-')[0]}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5 max-w-[300px]">
                             <p className="font-bold text-gray-900 line-clamp-1">{report.reason}</p>
                             <p className="text-gray-500 font-medium line-clamp-1 text-xs mt-1">{report.description}</p>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                                {report.reporter?.avatarUrl ? (
                                   <img src={report.reporter.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-gray-100 shadow-sm" />
                                ) : (
                                   <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400 border border-gray-200">
                                      {report.reporter?.username?.charAt(0).toUpperCase()}
                                   </div>
                                )}
                                <span className="font-bold text-gray-700">{report.reporter?.username}</span>
                             </div>
                          </td>
                           <td className="px-8 py-5 text-right">
                              <div className="flex justify-end opacity-60 hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => setSelectedReport(report)}
                                   className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-[10px] text-xs font-bold transition-all active:scale-95"
                                 >
                                    <Eye className="w-3.5 h-3.5" /> Xem xét
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                   </tbody>
                 </table>
                 {!reportsData?.items?.length && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                       <CheckCircle2 className="w-12 h-12 mb-4 opacity-10" />
                       <p className="font-bold">Sạch sẽ! Không có báo cáo nào.</p>
                    </div>
                 )}
               </div>
             )
          ) : activeTab === 'messages' ? (
            // --- Messages Tab Content ---
            messagesLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left align-middle border-collapse">
                   <thead className="bg-[#fcfcfc] text-gray-400 font-medium border-b border-gray-100/80 uppercase tracking-widest text-[10px]">
                     <tr>
                        <th className="px-8 py-5">Người gửi</th>
                        <th className="px-8 py-5">Nội dung</th>
                        <th className="px-8 py-5">Phòng (Zone)</th>
                        <th className="px-8 py-5">Thời gian</th>
                        <th className="px-8 py-5 text-right"></th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100/80">
                      {messagesData?.data?.map((msg: Message) => (
                         <tr key={msg.id} className="hover:bg-gray-50/40 transition-colors group/row">
                            <td className="px-8 py-5">
                               <div className="flex items-center gap-3">
                                  {msg.sender?.avatarUrl ? (
                                     <img src={msg.sender.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-gray-100" />
                                  ) : (
                                     <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-400 border border-indigo-100">
                                        {msg.sender?.username?.charAt(0).toUpperCase()}
                                     </div>
                                  )}
                                  <span className="font-bold text-gray-700">{msg.sender?.username}</span>
                               </div>
                            </td>
                            <td className="px-8 py-5 max-w-[400px]">
                               <div className={`p-3 rounded-[18px] text-[13px] font-medium leading-relaxed ${msg.isDeleted ? 'bg-red-50 text-red-500 italic border border-red-100' : 'bg-gray-100/60 text-gray-800'}`}>
                                  {msg.isDeleted ? "[Tin nhắn đã bị xóa]" : msg.content}
                               </div>
                            </td>
                            <td className="px-8 py-5">
                               <p className="text-gray-500 font-bold text-[11px] uppercase tracking-wide opacity-60">Via Zone</p>
                               <span className="font-bold text-gray-800 line-clamp-1">{msg.group?.zone?.title}</span>
                            </td>
                            <td className="px-8 py-5">
                               <div className="flex items-center gap-2 text-gray-400 font-medium text-xs">
                                  <Clock className="w-3.5 h-3.5" />
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </div>
                            </td>
                            <td className="px-8 py-5 text-right">
                               <div className="flex justify-end opacity-0 group-hover/row:opacity-100 transition-opacity">
                                  {!msg.isDeleted && (
                                     <button 
                                       onClick={() => {
                                         if(confirm('Bạn có chắc muốn xóa tin nhắn này vì vi phạm quy tắc?')) {
                                           deleteMsgMutation.mutate(msg.id);
                                         }
                                       }}
                                       className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-[10px] transition-all active:scale-95"
                                     >
                                        <Trash2 className="w-4 h-4" />
                                     </button>
                                  )}
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
                 {!messagesData?.data?.length && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                       <CheckCircle2 className="w-12 h-12 mb-4 opacity-10" />
                       <p className="font-bold">Sạch sẽ! Không có tin nhắn nào.</p>
                    </div>
                 )}
               </div>
             )
           ) : (
             // --- Tags Tab Content ---
             tagsLoading ? (
               <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left align-middle border-collapse">
                    <thead className="bg-[#fcfcfc] text-gray-400 font-medium border-b border-gray-100/80 uppercase tracking-widest text-[10px]">
                      <tr>
                         <th className="px-8 py-5">Tên Tag</th>
                         <th className="px-8 py-5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/80">
                       {tagsData?.map((tag: Tag) => {
                          if (searchQuery && !tag.name.toLowerCase().includes(searchQuery.toLowerCase())) return null;
                          return (
                          <tr key={tag.id} className="hover:bg-gray-50/40 transition-colors group/row">
                             <td className="px-8 py-5">
                                <span className="inline-block px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm border border-gray-200 shadow-sm">
                                   #{tag.name}
                                </span>
                             </td>
                             <td className="px-8 py-5 text-right">
                                <div className="flex justify-end gap-2 opacity-60 hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => { setTagName(tag.name); setEditTagModal({ open: true, tag }); }}
                                     className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-[10px] transition-all active:scale-95"
                                   >
                                      <Eye className="w-4 h-4" />
                                   </button>
                                   <button 
                                     onClick={() => setDeleteTagDialog({ open: true, tagId: tag.id })}
                                     className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-[10px] transition-all active:scale-95"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                </div>
                             </td>
                          </tr>
                       )})}
                    </tbody>
                 </table>
                 {!tagsData?.length && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                       <CheckCircle2 className="w-12 h-12 mb-4 opacity-10" />
                       <p className="font-bold">Chưa có Tag nào.</p>
                    </div>
                 )}
               </div>
             )
           )}
        </div>

        {/* --- Unified Pagination Footer --- */}
        {activeTab !== 'tags' && ((activeTab === 'reports' ? reportsData : messagesData)?.meta?.totalPages > 0) && (
          <div className="p-6 flex items-center justify-between bg-white/40 border-t border-gray-100/60 backdrop-blur-md">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 border border-white/80 rounded-2xl shadow-sm">
                <span className="text-xs font-bold text-gray-400">Trang</span>
                <span className="text-sm font-black text-gray-900">{page}</span>
                <span className="text-gray-300 mx-1">/</span>
                <span className="text-sm font-black text-gray-500">{(activeTab === 'reports' ? reportsData : messagesData).meta.totalPages}</span>
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
                  <div className="absolute bottom-full left-0 mb-2 w-20 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in z-50">
                    {[10, 20, 50, 100].map(v => (
                      <button 
                        key={v} 
                        onClick={() => { setLimit(v); resetPagination(); setIsLimitOpen(false); }}
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
                Tổng <span className="text-gray-900">{(activeTab === 'reports' ? reportsData : messagesData).meta.total}</span> kết quả
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
                onClick={() => setPage(p => Math.min((activeTab === 'reports' ? reportsData : messagesData).meta.totalPages, p + 1))} 
                disabled={page === (activeTab === 'reports' ? reportsData : messagesData).meta.totalPages} 
                className="p-2 hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent rounded-[10px] transition-all active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </StaggerItem>
      </StaggerContainer>

      {/* --- Detail Report Modal --- */}
      <AppleModal
         isOpen={!!selectedReport}
         onClose={() => setSelectedReport(null)}
         width="2xl"
      >
         {selectedReport && (
           <>
               <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/50 relative">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                        <AlertTriangle className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-gray-900 leading-none">Chi tiết báo cáo vi phạm</h3>
                        <p className="text-sm font-medium text-gray-400 mt-2">Mã vụ việc: <span className="font-mono text-gray-900">{selectedReport.id}</span></p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedReport(null)} className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                     <CheckCircle2 className="w-6 h-6 text-gray-300" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 space-y-4">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Reporter (Người tố cáo)</p>
                        <div className="flex items-center gap-4">
                           {selectedReport.reporter.avatarUrl ? (
                              <img src={selectedReport.reporter.avatarUrl} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                           ) : (
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-gray-500 border border-gray-200">
                                 {selectedReport.reporter.username.charAt(0).toUpperCase()}
                              </div>
                           )}
                           <div>
                              <p className="font-bold text-gray-900 text-base">{selectedReport.reporter.username}</p>
                              <p className="text-[10px] text-gray-400 font-mono">ID: {selectedReport.reporter.id.split('-')[0]}</p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="p-6 bg-rose-50/30 rounded-[32px] border border-rose-100/50 space-y-4">
                        <p className="text-[10px] font-extrabold text-rose-400 uppercase tracking-widest">Target (Đối tượng bị tố)</p>
                        <div className="flex items-center gap-4">
                           {selectedReport.targetUser?.avatarUrl ? (
                              <img src={selectedReport.targetUser.avatarUrl} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                           ) : (
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-rose-500 border border-rose-100">
                                 {selectedReport.targetUser?.username?.charAt(0).toUpperCase() || '?'}
                              </div>
                           )}
                           <div>
                              <p className="font-bold text-rose-900 text-base">{selectedReport.targetUser?.username || 'SYSTEM TARGET'}</p>
                              <p className="text-[10px] text-rose-400 font-mono">ID: {selectedReport.targetId.split('-')[0]}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        Nội dung tố cáo
                     </h4>
                     <div className="p-6 bg-gray-900 text-gray-100 rounded-[32px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldAlert className="w-20 h-20" /></div>
                        <p className="font-extrabold text-indigo-400 text-xs mb-2 tracking-widest uppercase">{selectedReport.reason}</p>
                        <p className="text-base font-medium leading-relaxed italic">"{selectedReport.description}"</p>
                     </div>
                  </div>

                  {selectedReport.status === 'OPEN' ? (
                     <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                           <CheckCircle2 className="w-4 h-4 text-gray-400" />
                           Action Plan (Cách xử lý)
                        </h4>
                        <textarea 
                           className="w-full p-6 bg-gray-50 border border-gray-200 rounded-[32px] focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none min-h-[120px] font-medium text-gray-800 placeholder:text-gray-400 text-sm"
                           placeholder="Nhập ghi chú xử lý (vd: Đã nhắc nhở, Đã ban vĩnh viễn, Báo cáo sai...)"
                           value={resolutionNote}
                           onChange={(e) => setResolutionNote(e.target.value)}
                         />
                     </div>
                  ) : (
                     <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100 flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mt-0.5" />
                        <div>
                           <p className="text-sm font-bold text-emerald-900 mb-1 leading-none uppercase tracking-wide">Đã hoàn thành xử lý</p>
                           <p className="text-gray-600 font-medium text-sm leading-relaxed">{selectedReport.resolutionNote}</p>
                        </div>
                     </div>
                  )}
               </div>

               {selectedReport.status === 'OPEN' && (
                  <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                     <button 
                        onClick={() => setSelectedReport(null)}
                        className="flex-1 px-8 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                     >
                        Lưu lại sau
                     </button>
                     <button 
                        onClick={handleResolve}
                        disabled={resolveMutation.isPending}
                        className="flex-1 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                     >
                        {resolveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                        Xác nhận xử lý
                     </button>
                  </div>
               )}
           </>
         )}
      </AppleModal>

      {/* --- Detail Tag Edit/Add Modal --- */}
      <AppleModal
         isOpen={editTagModal.open}
         onClose={() => setEditTagModal({ open: false, tag: null })}
         width="sm"
      >
         <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/50 relative">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">{editTagModal.tag ? 'Chỉnh sửa Tag' : 'Thêm Tag Mới'}</h3>
         </div>
         <div className="p-8 space-y-4">
            <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Tên Tag</label>
            <input 
              type="text" 
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Ví dụ: Rank Cao"
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-[14px] focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-bold text-gray-900"
            />
         </div>
         <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-3">
             <button onClick={() => setEditTagModal({ open: false, tag: null })} className="flex-1 py-3.5 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[16px] transition-all active:scale-95">Hủy</button>
             <button onClick={handleSaveTag} disabled={createTagMutation.isPending || updateTagMutation.isPending} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[16px] font-bold shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center">
                 {createTagMutation.isPending || updateTagMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu lại'}
             </button>
         </div>
      </AppleModal>

      {/* --- Delete Tag Confirm Modal --- */}
      <AppleModal
         isOpen={deleteTagDialog.open}
         onClose={() => setDeleteTagDialog({ open: false, tagId: null })}
         width="sm"
      >
         <div className="p-8">
             <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-rose-50 text-rose-500">
                <AlertTriangle className="w-7 h-7" />
             </div>
             <div className="text-center space-y-2 mb-8">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Xóa Tag</h3>
                <p className="text-sm font-medium text-gray-500 leading-relaxed">Bạn có chắc chắn muốn xóa Tag này? Hành động này sẽ loại bỏ Tag khỏi tất cả Zones liên quan.</p>
             </div>
             <div className="flex gap-3">
                <button onClick={() => setDeleteTagDialog({ open: false, tagId: null })} className="flex-1 py-3.5 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[18px] transition-all active:scale-95">Hủy</button>
                <button onClick={() => deleteTagDialog.tagId && deleteTagMutation.mutate(deleteTagDialog.tagId)} disabled={deleteTagMutation.isPending} className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-[18px] font-bold shadow-xl shadow-rose-500/25 transition-all">
                   {deleteTagMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Xóa ngay'}
                </button>
             </div>
         </div>
      </AppleModal>

    </div>
  );
}
