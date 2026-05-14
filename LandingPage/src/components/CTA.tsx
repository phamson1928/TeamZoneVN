
import { motion } from 'framer-motion';
import { Apple, PlayCircle } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-slate-900 border-t border-slate-800">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-primary/20 to-slate-900 border border-primary/30 rounded-[40px] p-8 md:p-16 text-center shadow-2xl shadow-primary/10 max-w-5xl mx-auto overflow-hidden relative"
        >
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-cta/20 rounded-full blur-[80px]"></div>

          <h2 className="text-4xl md:text-6xl font-heading text-white mb-6">
            SẴN SÀNG LEO <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cta">RANK CHƯA?</span>
          </h2>
          <p className="text-xl text-slate-300 font-body mb-10 max-w-2xl mx-auto">
            Gia nhập cùng hàng ngàn game thủ Việt Nam đã tìm thấy đội hình trong mơ của họ. Tải TeamZoneVN ngay hôm nay.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-2xl hover:bg-slate-200 transition-colors font-body font-bold text-lg group">
              <Apple className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs font-normal">Tải trên</div>
                <div className="leading-none text-xl font-heading">App Store</div>
              </div>
            </button>

            <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl hover:brightness-110 transition-all font-body font-bold text-lg group shadow-lg shadow-primary/30">
              <PlayCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs font-normal">TẢI TỪ</div>
                <div className="leading-none text-xl font-heading">Google Play</div>
              </div>
            </button>
          </div>
          
          <p className="mt-8 text-sm text-slate-400 font-body">
            Sử dụng hoàn toàn miễn phí. Hỗ trợ iOS và Android.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
