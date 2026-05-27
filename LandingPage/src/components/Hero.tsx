import { motion } from 'framer-motion';
import { Gamepad2, Users, MessageSquare, Download, Star, ShieldCheck } from 'lucide-react';
import mainUI from '../assets/giaodienchinh.png';

const Hero = () => {
  return (
    <section id="hero" className="relative pt-36 pb-20 overflow-hidden bg-slate-950 text-white min-h-screen flex items-center">
      {/* Background Gradients & Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900"></div>

      {/* Grid Pattern with fading edges */}
      <div 
        className="absolute inset-0 mask-image-[radial-gradient(ellipse_at_center,transparent_20%,black)]" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(37, 99, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 255, 0.04) 1px, transparent 1px)', 
          backgroundSize: '45px 45px' 
        }}
      ></div>

      {/* Glowing Neon Lights */}
      <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          
          {/* Left Side: Text Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Feature Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-body text-slate-300 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Phiên bản Beta 2.0 đã sẵn sàng
              </div>

              <h1 className="text-5xl lg:text-7xl font-heading mb-6 leading-none tracking-tight">
                TÌM ĐỒNG ĐỘI <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-secondary text-glow">
                  CHIẾN GAME
                </span>
              </h1>
              
              <p className="text-slate-300 text-base lg:text-lg font-body mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                TeamZoneVN kết nối bạn với những game thủ có cùng trình độ và phong cách chơi. Tạo phòng chờ ghép đội, trò chuyện thời gian thực và leo rank kịch tính. Đừng đi solo nữa!
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="#cta"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary via-blue-600 to-secondary text-white rounded-xl font-heading text-sm hover:scale-[1.03] transition-all shadow-lg shadow-primary/20 border border-primary/20"
                >
                  <Download className="w-5 h-5" />
                  Tải Ứng Dụng
                </a>
                <a
                  href="#showcase"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl font-heading text-sm transition-all border border-slate-800/80 backdrop-blur-sm"
                >
                  <Gamepad2 className="w-5 h-5 text-secondary" />
                  Xem Giao Diện
                </a>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-slate-400 font-body">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-400" />
                    </div>
                  ))}
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-yellow-500" />
                    <Star className="w-4 h-4 fill-yellow-500" />
                    <Star className="w-4 h-4 fill-yellow-500" />
                    <Star className="w-4 h-4 fill-yellow-500" />
                    <Star className="w-4 h-4 fill-yellow-500" />
                  </div>
                  <span className="text-xs tracking-wider text-slate-400">Kết nối hơn 10,000+ game thủ Việt Nam</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Smartphone Mockup & Floating Cards */}
          <div className="w-full lg:w-1/2 flex justify-center relative">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10 group"
            >
              {/* Phone Frame */}
              <div className="w-[300px] h-[610px] sm:w-[320px] sm:h-[650px] bg-slate-950 rounded-[40px] border-[8px] border-slate-900 shadow-2xl overflow-hidden relative shadow-primary/10">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20"></div>
                
                {/* Real App Screen Screenshot */}
                <img 
                  src={mainUI} 
                  alt="TeamZoneVN App Main Interface" 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Floating Element 1: Match Found */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-10 top-24 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md hidden sm:flex pointer-events-none"
              >
                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <Gamepad2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h5 className="font-heading text-xs text-white">Tìm Thấy Đội!</h5>
                  <p className="text-[10px] font-body text-slate-400">Valorant - Rank Bạch Kim</p>
                </div>
              </motion.div>

              {/* Floating Element 2: New Message */}
              <motion.div
                animate={{ y: [8, -8, 8] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-12 bottom-36 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md hidden sm:flex pointer-events-none"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h5 className="font-heading text-xs text-white">Tin Nhắn Mới</h5>
                  <p className="text-[10px] font-body text-slate-400">Lên đồ đi, tối nay chiến LoL...</p>
                </div>
              </motion.div>

              {/* Floating Element 3: Security Badge */}
              <motion.div
                animate={{ scale: [0.97, 1.03, 0.97] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-1/2 -translate-x-1/2 -bottom-6 bg-slate-900/90 border border-secondary/30 px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-md pointer-events-none"
              >
                <ShieldCheck className="w-4 h-4 text-secondary" />
                <span className="text-[11px] font-body font-semibold text-slate-200 uppercase tracking-wider">
                  Chống Toxic & Bảo mật 100%
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
