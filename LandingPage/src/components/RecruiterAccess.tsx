import { motion } from "framer-motion";
import { Download, ExternalLink, ShieldCheck, Smartphone } from "lucide-react";

const demoAccounts = [
  {
    role: "USER",
    title: "Ứng dụng Mobile",
    description: "Kiểm tra luồng tìm trận, tạo đội, trò chuyện và gửi yêu cầu tham gia.",
    email: "test-demo@teamzonevn.com",
    password: "User123456",
    href: "#cta",
    action: "Tải APK để trải nghiệm",
    icon: Smartphone,
  },
  {
    role: "ADMIN",
    title: "Admin Dashboard",
    description: "Kiểm tra quản lý người dùng, game, khu vực và nội dung kiểm duyệt.",
    email: "admin@teamzonevn.com",
    password: "User123456",
    href: "https://teamzonevn-admin.vercel.app/login",
    action: "Mở Admin Dashboard",
    icon: ShieldCheck,
  },
];

const RecruiterAccess = () => {
  return (
    <section id="recruiter-access" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <p className="text-primary font-heading text-sm tracking-[0.2em] mb-4">
            DÀNH CHO NHÀ TUYỂN DỤNG
          </p>
          <h2 className="font-heading text-3xl md:text-5xl text-white mb-5">
            TÀI KHOẢN <span className="text-primary">DEMO</span>
          </h2>
          <p className="font-body text-slate-400 text-base md:text-lg leading-relaxed">
            Sử dụng các tài khoản được seed riêng để đánh giá trải nghiệm người
            dùng và các chức năng quản trị của TeamZoneVN.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {demoAccounts.map((account, index) => {
            const Icon = account.icon;
            const isExternal = account.href.startsWith("http");

            return (
              <motion.article
                key={account.role}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 md:p-8 shadow-xl hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-heading text-xs tracking-widest px-3 py-1.5 rounded-full bg-secondary/15 text-violet-300 border border-secondary/20">
                    {account.role}
                  </span>
                </div>

                <h3 className="font-heading text-2xl text-white mb-3">
                  {account.title}
                </h3>
                <p className="font-body text-slate-400 leading-relaxed min-h-14 mb-6">
                  {account.description}
                </p>

                <dl className="space-y-3 mb-7 font-body text-sm">
                  <div className="rounded-xl bg-slate-950/70 border border-slate-800 px-4 py-3">
                    <dt className="text-slate-500 text-xs mb-1">Email</dt>
                    <dd className="text-slate-100 break-all">{account.email}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-950/70 border border-slate-800 px-4 py-3">
                    <dt className="text-slate-500 text-xs mb-1">Mật khẩu</dt>
                    <dd className="text-slate-100">{account.password}</dd>
                  </div>
                </dl>

                <a
                  href={account.href}
                  {...(isExternal
                    ? { target: "_blank", rel: "noreferrer" }
                    : undefined)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-heading text-sm hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
                >
                  {isExternal ? (
                    <ExternalLink className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {account.action}
                </a>
              </motion.article>
            );
          })}
        </div>

        <p className="max-w-3xl mx-auto mt-8 text-center font-body text-sm text-slate-500">
          Các tài khoản này chỉ dành cho đánh giá, dùng dữ liệu demo và có thể
          được làm mới định kỳ. Vui lòng không nhập thông tin cá nhân.
        </p>
      </div>
    </section>
  );
};

export default RecruiterAccess;
