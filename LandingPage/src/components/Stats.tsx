import { motion } from 'framer-motion';
import { Gamepad2, Heart, ShieldCheck, Flame } from 'lucide-react';

const Stats = () => {
  const stats = [
    {
      icon: <Gamepad2 className="w-6 h-6 text-primary" />,
      value: '10,000+',
      label: 'Game Thủ Hoạt Động',
      desc: 'Cộng đồng game thủ eSports Việt Nam đông đảo, văn minh và nhiệt huyết.'
    },
    {
      icon: <Flame className="w-6 h-6 text-cta" />,
      value: '50,000+',
      label: 'Trận Đấu Đã Ghép',
      desc: 'Số lượng phòng chơi được tạo và kết nối ghép đội thành công mỗi ngày.'
    },
    {
      icon: <Heart className="w-6 h-6 text-red-400" />,
      value: '500+',
      label: 'Đội Nhóm Thành Lập',
      desc: 'Các clan, nhóm bạn bè chơi chung gắn kết lâu dài qua hệ thống Group.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-green-400" />,
      value: '99.9%',
      label: 'Phản Hồi Tích Cực',
      desc: 'Được đánh giá cao nhờ tính năng lọc bài trùng và chống người chơi độc hại.'
    }
  ];

  return (
    <section className="py-20 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
      {/* Light grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-950/60 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-sm relative group hover:border-primary/30 transition-all hover:-translate-y-1"
            >
              {/* Outer hover border glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>

              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>

              <h3 className="font-heading text-4xl text-white mb-2 tracking-tight group-hover:text-primary transition-colors">
                {stat.value}
              </h3>
              
              <h4 className="font-body font-semibold text-slate-200 text-sm tracking-wide uppercase mb-3">
                {stat.label}
              </h4>
              
              <p className="font-body text-slate-400 text-xs leading-relaxed">
                {stat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
