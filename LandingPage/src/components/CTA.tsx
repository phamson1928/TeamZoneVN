import { motion } from 'framer-motion';
import { Apple, PlayCircle, Download } from 'lucide-react';
import logo from '../assets/logo.png';

const CTA = () => {
  return (
    <section id="cta" className="py-28 relative overflow-hidden bg-slate-950 border-t border-slate-900">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-[130px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-950/80 border border-slate-800/80 rounded-[40px] p-8 md:p-20 text-center shadow-2xl backdrop-blur-sm max-w-5xl mx-auto overflow-hidden relative"
        >
          {/* Neon corner gradients */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-72 h-72 bg-primary/10 rounded-full blur-[90px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-72 h-72 bg-secondary/15 rounded-full blur-[90px] pointer-events-none"></div>

          {/* App Logo Display */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block mb-8"
          >
            <img
              src={logo}
              alt="TeamZoneVN App Logo"
              className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-[0_0_15px_rgba(37,99,255,0.2)]"
            />
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-heading text-white mb-6 leading-none">
            SẴN SÀNG LEO <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-secondary">
              RANK CHƯA?
            </span>
          </h2>
          
          <p className="text-slate-300 font-body text-base md:text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
            Gia nhập cộng đồng game thủ Việt Nam để kết bạn, ghép đội nhanh chóng và trò chuyện thời gian thực ngay hôm nay.
          </p>

          <div className="flex flex-col lg:flex-row justify-center items-center gap-6 max-w-4xl mx-auto">
            {/* App Store Button */}
            <a
              href="#cta"
              onClick={(e) => {
                e.preventDefault();
                alert('Tính năng tải trên App Store sẽ sớm khả dụng trong bản Beta công khai sắp tới!');
              }}
              className="w-full lg:w-auto flex items-center justify-center gap-3.5 px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-950 rounded-2xl transition-all font-body font-bold text-base group shadow-lg hover:scale-[1.03] shrink-0"
            >
              <Apple className="w-8 h-8 group-hover:scale-105 transition-transform" />
              <div className="text-left">
                <div className="text-[10px] font-normal uppercase tracking-wider text-slate-500">Tải ứng dụng trên</div>
                <div className="leading-none text-lg font-heading">App Store</div>
              </div>
            </a>

            {/* Google Play Button */}
            <a
              href="#cta"
              onClick={(e) => {
                e.preventDefault();
                alert('Tính năng tải trên Google Play sẽ sớm khả dụng trong bản Beta công khai sắp tới!');
              }}
              className="w-full lg:w-auto flex items-center justify-center gap-3.5 px-6 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl transition-all font-body font-bold text-base group shadow-lg shadow-primary/20 hover:shadow-primary/40 border border-primary/20 hover:scale-[1.03] shrink-0"
            >
              <PlayCircle className="w-8 h-8 group-hover:scale-105 transition-transform" />
              <div className="text-left">
                <div className="text-[10px] font-normal uppercase tracking-wider text-blue-200">Tải ứng dụng trên</div>
                <div className="leading-none text-lg font-heading">Google Play</div>
              </div>
            </a>

            {/* Direct APK Download Button */}
            <a
              href="/teamzonevn.apk"
              download
              className="w-full lg:w-auto flex items-center justify-center gap-3.5 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all font-body font-bold text-base group shadow-lg border border-slate-800 hover:scale-[1.03] shrink-0"
            >
              <Download className="w-8 h-8 group-hover:scale-110 transition-transform text-primary" />
              <div className="text-left">
                <div className="text-[10px] font-normal uppercase tracking-wider text-slate-400">Tải trực tiếp file</div>
                <div className="leading-none text-lg font-heading">APK (Android)</div>
              </div>
            </a>
          </div>
          
          <p className="mt-10 text-xs text-slate-500 font-body tracking-wide">
            Hoàn toàn miễn phí. Hỗ trợ đầy đủ iOS (iPhone) và Android.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
