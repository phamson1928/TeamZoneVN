import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Database,
  Mail,
  Eye,
  Clock3,
} from "lucide-react";
import logo from "../assets/logo.png";

const policySections = [
  {
    icon: <Database className="w-5 h-5" />,
    title: "Thông tin chúng tôi thu thập",
    items: [
      "Thông tin tài khoản cơ bản như tên hiển thị, email và ảnh đại diện nếu bạn đăng ký.",
      "Dữ liệu sử dụng ứng dụng để tối ưu ghép đội, phòng chat và trải nghiệm đăng nhập.",
      "Thông tin thiết bị và nhật ký kỹ thuật cần thiết để phát hiện lỗi, bảo mật và chống gian lận.",
    ],
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: "Cách chúng tôi sử dụng thông tin",
    items: [
      "Cá nhân hóa trải nghiệm tìm đồng đội, phòng chơi và các tính năng cộng đồng.",
      "Vận hành các tính năng nhắn tin, báo cáo, xếp hạng và quản trị tài khoản.",
      "Cải thiện hiệu năng, độ ổn định và phát hiện hành vi vi phạm nội quy.",
    ],
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Chia sẻ dữ liệu",
    items: [
      "Chúng tôi không bán dữ liệu cá nhân của bạn cho bên thứ ba.",
      "Một số dữ liệu có thể được chia sẻ với nhà cung cấp hạ tầng để vận hành dịch vụ, theo nguyên tắc tối thiểu cần thiết.",
      "Dữ liệu có thể được cung cấp cho cơ quan có thẩm quyền khi có yêu cầu hợp lệ theo quy định pháp luật.",
    ],
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Bảo mật và lưu trữ",
    items: [
      "Chúng tôi áp dụng biện pháp bảo mật phù hợp để giảm rủi ro truy cập trái phép hoặc rò rỉ dữ liệu.",
      "Dữ liệu chỉ được lưu giữ trong thời gian cần thiết cho mục đích vận hành và tuân thủ.",
      "Tài khoản vi phạm hoặc dữ liệu không còn cần thiết có thể được ẩn, xóa hoặc vô hiệu hóa theo chính sách nội bộ.",
    ],
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#090D1A] text-white relative overflow-hidden selection:bg-primary/30 selection:text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
      <div className="absolute top-[-120px] right-[-120px] w-[340px] h-[340px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-120px] left-[-120px] w-[380px] h-[380px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between gap-4 mb-10"
        >
          <a
            href="#hero"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay về trang chủ
          </a>
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="TeamZoneVN Logo"
              className="h-9 w-auto object-contain"
            />
            <span className="font-heading text-lg tracking-wide">
              TeamZoneVN
            </span>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="bg-slate-950/80 border border-slate-800/80 rounded-[32px] p-6 md:p-10 shadow-2xl backdrop-blur-sm"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary mb-6">
            <ShieldCheck className="w-4 h-4" />
            Chính sách Bảo mật
          </div>

          <h1 className="text-3xl md:text-5xl font-heading leading-tight mb-4">
            PRIVACY POLICY
          </h1>
          <p className="text-slate-300 leading-relaxed max-w-3xl">
            Chính sách này mô tả cách TeamZoneVN thu thập, sử dụng và bảo vệ dữ
            liệu của bạn khi sử dụng nền tảng. Nội dung dưới đây là bản chính
            sách công khai dành cho landing page và có thể được cập nhật khi sản
            phẩm phát triển.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <Clock3 className="w-5 h-5 text-primary mb-3" />
              <p className="text-sm text-slate-300">
                Cập nhật theo từng phiên bản sản phẩm và yêu cầu pháp lý.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <Lock className="w-5 h-5 text-secondary mb-3" />
              <p className="text-sm text-slate-300">
                Ưu tiên tối thiểu hóa dữ liệu, bảo mật tài khoản và chống lạm
                dụng.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <Mail className="w-5 h-5 text-cta mb-3" />
              <p className="text-sm text-slate-300">
                Liên hệ để yêu cầu hỗ trợ quyền riêng tư hoặc chỉnh sửa dữ liệu.
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-5">
            {policySections.map((section) => (
              <article
                key={section.title}
                className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    {section.icon}
                  </div>
                  <h2 className="font-heading text-xl text-white">
                    {section.title}
                  </h2>
                </div>
                <ul className="space-y-3 text-slate-300 leading-relaxed">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-secondary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-slate-800 bg-gradient-to-r from-primary/10 to-secondary/10 p-6 md:p-8">
            <h2 className="font-heading text-xl mb-3">
              Liên hệ về quyền riêng tư
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Nếu bạn muốn yêu cầu xem, cập nhật hoặc xóa dữ liệu cá nhân, hãy
              liên hệ trực tiếp với đội ngũ TeamZoneVN.
            </p>
            <a
              href="mailto:pson4282@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-950 font-heading hover:scale-[1.02] transition-transform"
            >
              <Mail className="w-4 h-4" />
              pson4282@gmail.com
            </a>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
