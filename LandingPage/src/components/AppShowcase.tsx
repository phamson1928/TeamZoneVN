import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Users, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import mainUI from '../assets/giaodienchinh.png';
import teamUI from '../assets/doinhom.png';
import chatUI from '../assets/trangchat.png';

const AppShowcase = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 0,
      label: 'Sảnh Ghép Đội',
      icon: <Compass className="w-5 h-5" />,
      title: 'Tìm Kiếm Đồng Đội Linh Hoạt',
      description: 'Lọc phòng theo Tựa game, Cấp độ Rank, Thẻ tính cách và Phong cách chơi. Cho phép tìm bạn chơi nhanh chóng chỉ trong vài thao tác chạm.',
      image: mainUI,
      badge: 'Đang mở rộng',
      points: [
        'Bộ lọc trò chơi đa dạng',
        'Hiện số thành viên thời gian thực',
        'Hỗ trợ đầy đủ các rank từ thấp đến cao',
        'Thông tin liên lạc hiển thị an toàn'
      ]
    },
    {
      id: 1,
      label: 'Quản Lý Đội Nhóm',
      icon: <Users className="w-5 h-5" />,
      title: 'Tự Động Thành Lập Nhóm Chơi',
      description: 'Khi phòng chờ của bạn đủ người hoặc được chủ phòng duyệt yêu cầu, hệ thống sẽ tự động khởi tạo Đội nhóm (Group) để chốt lịch chơi game.',
      image: teamUI,
      badge: 'Đã tối ưu',
      points: [
        'Duyệt/từ chối người chơi xin vào phòng',
        'Tự động chuyển từ phòng chờ sang nhóm đấu',
        'Quản lý vai trò (Owner/Member) trực quan',
        'Tùy chọn rời nhóm hoặc giải tán nhanh gọn'
      ]
    },
    {
      id: 2,
      label: 'Phòng Chat Real-time',
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Lên Kế Hoạch & Chiến Thuật Tức Thời',
      description: 'Giao tiếp mượt mà ngay trong ứng dụng với tốc độ truyền tin nhắn siêu tốc qua Socket.io. Chat riêng tư và an toàn chỉ dành cho thành viên trong nhóm.',
      image: chatUI,
      badge: 'Bảo mật cao',
      points: [
        'Nhận tin nhắn tức thì bằng Socket.io',
        'Hiển thị trạng thái đang nhập chữ (Typing...)',
        'Tự động dọn dẹp lịch sử chat cũ sau 30 ngày',
        'Hard-delete an toàn khi giải tán nhóm'
      ]
    }
  ];

  return (
    <section id="showcase" className="py-28 bg-slate-950 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-heading text-xs tracking-widest uppercase bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
              Trải Nghiệm Thực Tế
            </span>
            <h2 className="text-4xl md:text-6xl font-heading mt-6 mb-5 text-white leading-tight">
              KHÁM PHÁ <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary">GIAO DIỆN </span> APP
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto font-body text-lg">
              Hình ảnh chụp màn hình trực tiếp từ phiên bản Mobile App đang vận hành ổn định trên thiết bị Android và iOS.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left Side: Tabs */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 order-2 lg:order-1">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900/60 border-primary/30 shadow-lg shadow-primary/5'
                      : 'bg-transparent border-slate-900 hover:border-slate-800/80'
                  }`}
                >
                  {/* Subtle active glow line on left */}
                  {isSelected && (
                    <motion.div
                      layoutId="tabGlowLine"
                      className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-primary to-secondary"
                    />
                  )}

                  <div className="flex gap-5 items-start">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-slate-900 border-slate-800 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {tab.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3
                          className={`font-heading text-lg transition-colors ${
                            isSelected ? 'text-white' : 'text-slate-300'
                          }`}
                        >
                          {tab.label}
                        </h3>
                        <span
                          className={`text-[10px] font-body px-2 py-0.5 rounded border ${
                            isSelected
                              ? 'bg-secondary/15 border-secondary/30 text-purple-300'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      </div>

                      {/* Expandable Tab Content */}
                      <AnimatePresence initial={false}>
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <p className="text-slate-400 font-body text-[15px] mt-3 leading-relaxed">
                              {tab.description}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                              {tab.points.map((pt, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-slate-300 text-xs font-body">
                                  <ShieldCheck className="w-3.5 h-3.5 text-secondary shrink-0" />
                                  <span>{pt}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <ArrowRight
                      className={`w-5 h-5 self-center transition-all ${
                        isSelected ? 'text-primary translate-x-0' : 'text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Side: Smartphone Mockup */}
          <div className="w-full lg:w-1/2 flex justify-center order-1 lg:order-2">
            <div className="relative">
              {/* Outer Cyan/Magenta Aura */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-secondary rounded-[42px] blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              
              {/* Phone Frame */}
              <div className="w-[300px] h-[610px] sm:w-[320px] sm:h-[650px] bg-slate-950 rounded-[40px] border-[8px] border-slate-900 shadow-2xl overflow-hidden relative">
                {/* Speaker Grill / Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20"></div>

                {/* Screenshot view with AnimatePresence */}
                <div className="w-full h-full bg-slate-900">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeTab}
                      src={tabs[activeTab].image}
                      alt={tabs[activeTab].label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                </div>
              </div>

              {/* Decorative side highlights */}
              <div className="absolute -left-10 top-20 w-8 h-24 bg-primary/20 rounded-full blur-xl pointer-events-none"></div>
              <div className="absolute -right-10 bottom-20 w-8 h-24 bg-secondary/20 rounded-full blur-xl pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppShowcase;
