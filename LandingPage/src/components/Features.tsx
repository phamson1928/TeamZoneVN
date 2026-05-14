
import { motion } from 'framer-motion';
import { Trophy, Zap, Shield, Users, Layers, MessageCircle } from 'lucide-react';

const features = [
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Tạo Phòng Chơi Game",
    description: "Tạo phòng chơi với các yêu cầu cụ thể. Đặt tựa game, tiêu chí rank, và phong cách chơi để tìm đồng đội hoàn hảo."
  },
  {
    icon: <Trophy className="w-8 h-8 text-secondary" />,
    title: "Bảng Xếp Hạng Kịch Tính",
    description: "Leo rank và ghi tên mình lên bảng xếp hạng của TeamZoneVN. Chứng minh kỹ năng và nhận những phần thưởng xứng đáng."
  },
  {
    icon: <MessageCircle className="w-8 h-8 text-cta" />,
    title: "Chat Trực Tiếp",
    description: "Lên chiến thuật ngay lập tức. Mỗi phòng đều có một kênh chat riêng để lên kế hoạch cho chiến thắng tiếp theo của bạn."
  },
  {
    icon: <Zap className="w-8 h-8 text-yellow-400" />,
    title: "Thông Báo Tức Thì",
    description: "Nhận thông báo ngay lập tức khi có người tham gia phòng của bạn hoặc gửi tin nhắn. Đừng bao giờ bỏ lỡ một trận đấu."
  },
  {
    icon: <Shield className="w-8 h-8 text-green-400" />,
    title: "Hồ Sơ Xác Thực",
    description: "Liên kết tài khoản game của bạn để xác minh rank và chỉ số. Chơi cùng game thủ thật, không phải tài khoản clone."
  },
  {
    icon: <Layers className="w-8 h-8 text-purple-400" />,
    title: "Hỗ Trợ Đa Game",
    description: "Cho dù bạn chơi League of Legends, Valorant, CS:GO, hay Mobile Legends, chúng tôi hỗ trợ tìm kiếm đồng đội cho tất cả các tựa game eSports phổ biến."
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-heading mb-4 text-white">
              TẤT CẢ NHỮNG GÌ BẠN CẦN ĐỂ <span className="text-primary">THỐNG TRỊ</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto font-body text-lg">
              Chúng tôi tạo ra TeamZoneVN bởi vì việc tìm kiếm đồng đội tốt không nên khó hơn việc chiến thắng chính trận game đó.
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
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-primary/50 transition-colors group relative"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
              
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 border border-slate-700 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-heading text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 font-body leading-relaxed">
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
