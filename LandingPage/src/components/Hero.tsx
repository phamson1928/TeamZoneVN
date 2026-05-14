
import { motion } from 'framer-motion';
import { Gamepad2, Users, MessageSquare, Download, Star } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-slate-900 text-white min-h-screen flex items-center">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Text Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-7xl font-heading mb-6 leading-tight">
                TÌM KIẾM ĐỒNG ĐỘI <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">HOÀN HẢO</span>
              </h1>
              
              <p className="text-slate-300 text-lg lg:text-xl font-body mb-8 max-w-2xl mx-auto lg:mx-0">
                TeamZoneVN kết nối bạn với những game thủ cùng chí hướng. Tạo phòng, ghép trận dựa trên rank, và giao tiếp mượt mà. Đừng chơi solo nữa, hãy bắt đầu chiến thắng cùng nhau.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cta to-orange-400 text-white rounded-xl font-heading text-lg hover:scale-105 transition-transform shadow-lg shadow-cta/30">
                  <Download className="w-6 h-6" />
                  Tải Ứng Dụng
                </button>
                <button className="flex items-center gap-2 px-8 py-4 bg-slate-800 text-white rounded-xl font-heading text-lg hover:bg-slate-700 transition-colors border border-slate-700">
                  <Gamepad2 className="w-6 h-6 text-primary" />
                  Khám Phá Game
                </button>
              </div>
              
              {/* Ratings */}
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-slate-400 font-body">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center`}>
                      <Users className="w-5 h-5 text-slate-300" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-yellow-500" />
                    <Star className="w-4 h-4 fill-yellow-500" />
                    <Star className="w-4 h-4 fill-yellow-500" />
                    <Star className="w-4 h-4 fill-yellow-500" />
                    <Star className="w-4 h-4 fill-yellow-500" />
                  </div>
                  <span className="text-sm">Được tin dùng bởi 10k+ game thủ</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* App Mockup */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
            {/* Decorative blurs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/30 rounded-full blur-[100px] pointer-events-none"></div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10"
            >
              {/* Phone Frame */}
              <div className="w-[320px] h-[650px] bg-slate-950 rounded-[40px] border-[8px] border-slate-800 shadow-2xl overflow-hidden relative shadow-primary/20">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
                
                {/* App Content Fake */}
                <div className="h-full w-full bg-slate-900 text-white font-body p-4 pt-10 flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-heading text-xl text-primary">TeamZoneVN</h3>
                      <p className="text-xs text-slate-400">Chào mừng trở lại, Player1!</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-primary">
                      <Gamepad2 className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  {/* Active Zone */}
                  <div className="bg-slate-800 p-4 rounded-2xl mb-4 border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs bg-cta/20 text-cta px-2 py-1 rounded">Ranked Duo</span>
                      <span className="text-xs text-slate-400">1/2 Người</span>
                    </div>
                    <h4 className="font-heading text-lg mb-1">League of Legends</h4>
                    <p className="text-sm text-slate-400 mb-3">Đang tìm Hỗ trợ rank Vàng/Bạch Kim!</p>
                    <button className="w-full py-2 bg-primary/20 text-primary rounded-xl font-bold border border-primary/30">Vào Phòng</button>
                  </div>

                  {/* Recent Messages */}
                  <h4 className="font-heading text-sm mb-3 text-slate-300">Tin nhắn gần đây</h4>
                  <div className="space-y-3 flex-grow">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                          <Users className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-grow">
                          <h5 className="font-bold text-sm">Đội {i}</h5>
                          <p className="text-xs text-slate-400 truncate">Tối nay 8 giờ chiến nhé...</p>
                        </div>
                        <MessageSquare className="w-4 h-4 text-slate-500" />
                      </div>
                    ))}
                  </div>

                  {/* Tab Bar */}
                  <div className="mt-auto h-16 bg-slate-800 rounded-2xl flex justify-around items-center px-6">
                    <Gamepad2 className="w-6 h-6 text-primary" />
                    <Users className="w-6 h-6 text-slate-500" />
                    <MessageSquare className="w-6 h-6 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-8 md:-right-12 top-20 bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-3 hidden sm:flex"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h5 className="font-bold text-sm">Tìm Thấy Trận!</h5>
                  <p className="text-xs text-slate-400">Valorant - Rank Flex</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-8 md:-left-12 bottom-32 bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-3 hidden sm:flex"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h5 className="font-bold text-sm">Tin Nhắn Mới</h5>
                  <p className="text-xs text-slate-400">Sẵn sàng cho giải đấu chưa?</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
