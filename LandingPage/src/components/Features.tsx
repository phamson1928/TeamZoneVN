import { motion } from 'framer-motion';
import { Trophy, Zap, Shield, Users, Layers, MessageSquare } from 'lucide-react';

const features = [
  {
    icon: <Users className="w-6 h-6 text-primary" />,
    title: "Tạo Phòng Chơi Game",
    description: "Tạo phòng chơi với các yêu cầu cụ thể. Đặt tựa game, tiêu chí rank, và phong cách chơi để tìm đồng đội hoàn hảo.",
    color: 'from-blue-500/20 to-cyan-500/5',
    borderColor: 'group-hover:border-primary/40'
  },
  {
    icon: <Trophy className="w-6 h-6 text-secondary" />,
    title: "Bảng Xếp Hạng Kịch Tính",
    description: "Leo rank và ghi tên mình lên bảng xếp hạng của TeamZoneVN. Chứng minh kỹ năng và nhận những lượt yêu thích từ cộng đồng.",
    color: 'from-purple-500/20 to-pink-500/5',
    borderColor: 'group-hover:border-secondary/40'
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-yellow-400" />,
    title: "Chat Trực Tiếp Nhóm",
    description: "Lên chiến thuật ngay lập tức. Mỗi phòng đều có một kênh chat riêng để lên kế hoạch cho chiến thắng tiếp theo của bạn.",
    color: 'from-yellow-500/20 to-orange-500/5',
    borderColor: 'group-hover:border-yellow-500/40'
  },
  {
    icon: <Zap className="w-6 h-6 text-amber-500" />,
    title: "Thông Báo Tức Thì",
    description: "Nhận thông báo ngay lập tức khi có người yêu cầu tham gia phòng của bạn hoặc gửi tin nhắn. Đừng bao giờ bỏ lỡ một trận đấu.",
    color: 'from-amber-500/20 to-yellow-600/5',
    borderColor: 'group-hover:border-amber-500/40'
  },
  {
    icon: <Shield className="w-6 h-6 text-green-400" />,
    title: "Hồ Sơ Game Chi Tiết",
    description: "Thiết lập hồ sơ game cá nhân hiển thị rõ ràng cấp độ rank, vai trò sở trường và phong cách chơi để dễ dàng tìm kiếm đồng đội phù hợp nhất.",
    color: 'from-green-500/20 to-emerald-500/5',
    borderColor: 'group-hover:border-green-500/40'
  },
  {
    icon: <Layers className="w-6 h-6 text-pink-500" />,
    title: "Hỗ Trợ Đa Game",
    description: "Cho dù bạn chơi League of Legends, Valorant, CS2, hay Liên Quân, chúng tôi hỗ trợ tìm kiếm đồng đội cho tất cả các tựa game eSports phổ biến.",
    color: 'from-pink-500/20 to-purple-500/5',
    borderColor: 'group-hover:border-pink-500/40'
  }
];

const Features = () => {
  return (
    <section id="features" className="py-28 bg-slate-950 relative overflow-hidden border-t border-slate-900">
      {/* Background neon glows */}
      <div className="absolute top-[30%] right-[-10%] w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[30%] left-[-10%] w-[350px] h-[350px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-secondary font-heading text-xs tracking-widest uppercase bg-secondary/10 px-4 py-1.5 rounded-full border border-secondary/20">
              Tính Năng Độc Đáo
            </span>
            <h2 className="text-4xl md:text-6xl font-heading mt-6 mb-5 text-white">
              TẤT CẢ ĐỂ <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">THỐNG TRỊ</span> TRẬN ĐẤU
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto font-body text-base md:text-lg">
              Chúng tôi tối ưu hóa quy trình ghép đội của bạn để bạn chỉ cần tập trung vào việc chơi và giành chiến thắng.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group bg-slate-900/35 border border-slate-900 p-8 rounded-3xl hover:bg-slate-900/65 transition-all duration-300 relative overflow-hidden"
              style={{ contentVisibility: 'auto' }}
            >
              {/* Glowing gradient border outline */}
              <div className={`absolute inset-0 border border-transparent rounded-3xl transition-all duration-300 ${feature.borderColor}`}></div>
              
              {/* Background gradient mask on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none`}></div>
              
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-heading text-white mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
              <p className="text-slate-400 font-body text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
