import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Gamepad2, 
  AlertTriangle, 
  X, 
  Loader2, 
  Check, 
  ImageIcon, 
  UploadCloud 
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../lib/axios';
import { userApi } from '../lib/api';
import { StaggerContainer, StaggerItem } from '../components/layout/PageTransition';
import { AppleModal } from '../components/common/AppleModal';
import { CustomDropdown } from '../components/common/CustomDropdown';

interface Game {
  id: string;
  name: string;
  iconUrl?: string;
  bannerUrl?: string;
  isActive: boolean;
  createdAt: string;
  platforms?: string[];
}

export default function GameManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    gameId: string | null;
  }>({ open: false, gameId: null });

  const [editModal, setEditModal] = useState<{
    open: boolean;
    game: Game | null;
  }>({ open: false, game: null });

  const [formData, setFormData] = useState({
    iconUrl: '',
    bannerUrl: '',
    isActive: 'true'
  });

  // Custom upload handler
  const [uploadingField, setUploadingField] = useState<'icon' | 'banner' | null>(null);

  const handleEditClick = (game: Game) => {
    setEditModal({ open: true, game });
    setFormData({
      iconUrl: game.iconUrl || '',
      bannerUrl: game.bannerUrl || '',
      isActive: game.isActive !== false ? 'true' : 'false'
    });
  };

  const handleCreateClick = () => {
    setEditModal({ open: true, game: null });
    setFormData({ iconUrl: '', bannerUrl: '', isActive: 'true' });
  };

  const { data: gamesData, isLoading } = useQuery<Game[]>({
    queryKey: ['games-admin'],
    queryFn: async () => {
      const payload = await userApi.get('/games/admin');
      return payload || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Game>) => userApi.post('/games', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games-admin'] });
      toast.success('Đã thêm game mới');
      setEditModal({ open: false, game: null });
    },
    onError: () => toast.error('Lỗi khi thêm game'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Game> }) =>
      userApi.patch(`/games/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games-admin'] });
      toast.success('Cập nhật thành công');
      setEditModal({ open: false, game: null });
    },
    onError: () => toast.error('Lỗi khi cập nhật'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.delete(`/games/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games-admin'] });
      toast.success('Đã xóa game');
      setConfirmDialog({ open: false, gameId: null });
    },
    onError: () => toast.error('Lỗi khi xóa game. Có thể game này đang có người chơi.'),
  });

  const handleDelete = () => {
    if (confirmDialog.gameId) {
      deleteMutation.mutate(confirmDialog.gameId);
    }
  };

  const handleSaveGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const name = (formEl.elements.namedItem('name') as HTMLInputElement).value;

    const data = {
      name: name,
      iconUrl: formData.iconUrl,
      bannerUrl: formData.bannerUrl,
      isActive: formData.isActive === 'true',
    };

    // Note: If backend expects array for platforms, we handled it here temporarily
    // For now we just implement the basic fields
    if (!data.name) {
        toast.error('Tên game là bắt buộc');
        return;
    }

    if (editModal.game) {
      updateMutation.mutate({ id: editModal.game.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredGames: Game[] = (Array.isArray(gamesData) ? gamesData : []).filter((g: Game) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý Game</h1>
           <p className="text-sm font-medium text-gray-500 mt-1">Thêm và quản lý các tựa game trên hệ thống</p>
        </div>
        <button onClick={handleCreateClick} className="px-5 py-3 bg-gray-900 hover:bg-black text-white rounded-[16px] font-bold shadow-xl shadow-gray-900/20 flex items-center gap-2 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          <span>Thêm Game mới</span>
        </button>
      </div>

      <StaggerContainer className="space-y-8">
        <StaggerItem className="relative z-20 bg-white/70 backdrop-blur-2xl rounded-[24px] shadow-sm border border-white/60 p-5">
           <div className="w-full relative group">
              <input
                 type="text"
                 placeholder="Tìm kiếm game..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-5 pr-4 py-3 bg-gray-50 border border-transparent rounded-[16px] focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
              />
           </div>
        </StaggerItem>

        <StaggerItem className="relative z-10 bg-white/80 backdrop-blur-3xl rounded-[32px] border border-white/40 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-gray-100">
                  <th className="px-6 py-5">Game</th>
                  <th className="px-6 py-5">Trạng thái</th>
                  <th className="px-6 py-5">Ngày Thêm</th>
                  <th className="px-6 py-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {filteredGames.length === 0 ? (
                   <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">Không tìm thấy tựa game nào.</td>
                   </tr>
                ) : filteredGames.map((game: Game) => (
                  <tr key={game.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[14px] bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                          {game.iconUrl ? (
                            <img src={game.iconUrl} alt={game.name} className="w-full h-full object-cover" />
                          ) : (
                            <Gamepad2 className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{game.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider ${game.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                        {game.isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                        {!game.isActive && <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>}
                        {game.isActive ? 'HOẠT ĐỘNG' : 'ĐÃ ẨN'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-500">
                      {new Date(game.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex justify-end gap-2 opacity-70 hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(game)} className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-[12px] transition-all active:scale-95" title="Chỉnh sửa"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setConfirmDialog({ open: true, gameId: game.id })} className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-[12px] transition-all active:scale-95" title="Xóa game"><Trash2 className="w-4 h-4" /></button>
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

      {/* Edit/Create Modal */}
      <AppleModal
         isOpen={editModal.open}
         onClose={() => setEditModal({ open: false, game: null })}
         width="md"
      >
         <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/50">
            <h3 className="text-xl font-black tracking-tight">{editModal.game ? 'Chỉnh sửa Game' : 'Thêm Game Mới'}</h3>
            <button type="button" onClick={() => setEditModal({ open: false, game: null })} className="p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-90"><X className="w-6 h-6 text-gray-400" /></button>
         </div>
         <form onSubmit={handleSaveGame} className="p-8 space-y-5">
            <div className="space-y-1.5">
               <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Tên Game <span className="text-rose-500">*</span></label>
               <input 
                  type="text" 
                  name="name" 
                  defaultValue={editModal.game?.name || ''} 
                  required
                  placeholder="Ví dụ: Liên Minh Huyền Thoại"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-[14px] focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-bold text-gray-900"
               />
            </div>
            <div className="space-y-1.5">
               <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Icon Game</label>
               <div className="relative flex items-center gap-4">
                 {formData.iconUrl ? (
                   <img src={formData.iconUrl} alt="Icon Preview" className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm" />
                 ) : (
                   <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                     <ImageIcon className="w-6 h-6 text-gray-300" />
                   </div>
                 )}
                 <div className="flex-1 relative">
                   <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingField('icon');
                        try {
                          const fData = new FormData();
                          fData.append('file', file);
                          const res: any = await apiClient.post('/files/upload/game-icon', fData, { headers: { 'Content-Type': 'multipart/form-data' }});
                          setFormData(p => ({ ...p, iconUrl: res?.url || res?.data?.url || '' }));
                        } catch (err) {
                          toast.error('Lỗi khi tải ảnh lên');
                        } finally {
                          setUploadingField(null);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   />
                   <div className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-[14px] flex justify-between items-center text-sm font-bold text-indigo-600 hover:bg-slate-100 transition-all pointer-events-none">
                     <span>{uploadingField === 'icon' ? 'Đang tải lên...' : 'Chọn hoặc thả ảnh từ máy...'}</span>
                     {uploadingField === 'icon' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                   </div>
                 </div>
               </div>
               <div className="relative mt-2">
                 <input type="url" value={formData.iconUrl} onChange={e => setFormData(p => ({...p, iconUrl: e.target.value}))} placeholder="Hoặc nhập URL icon trực tiếp" className="w-full px-4 py-2 bg-gray-50/50 border border-gray-100 rounded-[10px] text-xs font-medium text-gray-600 outline-none focus:bg-white focus:border-indigo-500/30" />
               </div>
             </div>
             
             <div className="space-y-1.5">
               <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Banner Game</label>
               <div className="relative flex items-center gap-4">
                 {formData.bannerUrl ? (
                   <img src={formData.bannerUrl} alt="Banner Preview" className="w-24 h-16 rounded-xl object-cover border border-gray-200 shadow-sm" />
                 ) : (
                   <div className="w-24 h-16 rounded-xl bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                     <ImageIcon className="w-6 h-6 text-gray-300" />
                   </div>
                 )}
                 <div className="flex-1 relative">
                   <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingField('banner');
                        try {
                          const fData = new FormData();
                          fData.append('file', file);
                          const res: any = await apiClient.post('/files/upload/game-banner', fData, { headers: { 'Content-Type': 'multipart/form-data' }});
                          setFormData(p => ({ ...p, bannerUrl: res?.url || res?.data?.url || '' }));
                        } catch (err) {
                          toast.error('Lỗi khi tải ảnh lên');
                        } finally {
                          setUploadingField(null);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   />
                   <div className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-[14px] flex justify-between items-center text-sm font-bold text-indigo-600 hover:bg-slate-100 transition-all pointer-events-none">
                     <span>{uploadingField === 'banner' ? 'Đang tải lên...' : 'Chọn hoặc thả ảnh từ máy...'}</span>
                     {uploadingField === 'banner' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                   </div>
                 </div>
               </div>
             </div>
             <div className="space-y-1.5 pt-2">
               <label className="block mb-2 text-xs font-black uppercase text-gray-500 tracking-wider">Trạng thái (Ẩn/Hiện)</label>
               <CustomDropdown
                  options={[
                    { value: 'true', label: 'Hoạt động (Hiển thị công khai)' },
                    { value: 'false', label: 'Đã ẩn (Bảo trì)' }
                  ]}
                  value={formData.isActive}
                  onChange={(val) => setFormData(p => ({ ...p, isActive: val }))}
                  className="w-full bg-gray-50 border-gray-200/60"
               />
             </div>
            
            <div className="pt-6 border-t border-gray-100 flex gap-3">
               <button type="button" onClick={() => setEditModal({ open: false, game: null })} className="flex-1 py-3.5 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[16px] transition-all active:scale-95">Hủy bỏ</button>
               <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[16px] font-bold shadow-xl shadow-indigo-600/25 transition-all active:scale-95 flex items-center justify-center gap-2">
                 {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                 <span>Lưu thay đổi</span>
               </button>
            </div>
         </form>
      </AppleModal>

      {/* Delete Confirmation Modal */}
      <AppleModal
         isOpen={confirmDialog.open}
         onClose={() => setConfirmDialog({ open: false, gameId: null })}
         width="sm"
      >
         <div className="p-8">
             <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-rose-50 text-rose-500">
                <AlertTriangle className="w-7 h-7" />
             </div>
             <div className="text-center space-y-2 mb-8">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Xóa Tựa Game</h3>
                <p className="text-sm font-medium text-gray-500 leading-relaxed">Bạn có chắc chắn muốn xóa tựa game này? Hành động này sẽ xóa tất cả Zones, Groups liên quan đến game (cascade).</p>
             </div>
             <div className="flex gap-3">
                <button onClick={() => setConfirmDialog({ open: false, gameId: null })} className="flex-1 py-3.5 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[18px] transition-all active:scale-95">Hủy</button>
                <button onClick={handleDelete} disabled={deleteMutation.isPending} className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-[18px] font-bold shadow-xl shadow-rose-500/25 transition-all active:scale-95 flex justify-center items-center">
                   {deleteMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xóa ngay'}
                </button>
             </div>
         </div>
      </AppleModal>

    </div>
  );
}
