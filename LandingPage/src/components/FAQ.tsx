import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'TeamZoneVN hỗ trợ những tựa game nào?',
      answer: 'Chúng tôi hỗ trợ tìm đồng đội cho tất cả các tựa game eSports và PC/Mobile phổ biến hiện nay như League of Legends (Liên Minh Huyền Thoại), Valorant, CS2, Arena of Valor (Liên Quân Mobile), PUBG Mobile, Tốc Chiến, Genshin Impact, và nhiều game khác theo yêu cầu của cộng đồng.'
    },
    {
      question: 'Làm thế nào để tìm đồng đội và tham gia phòng chơi?',
      answer: 'Bạn có thể chọn phòng (Zone) có sẵn trong sảnh chờ phù hợp với cấp độ Rank của mình và bấm "Gửi yêu cầu tham gia". Hoặc bạn có thể chủ động bấm "Tạo phòng mới", nhập yêu cầu chi tiết (ví dụ: cần mic, chơi chill hoặc leo rank hardcore) và chờ người khác gửi yêu cầu vào phòng của bạn.'
    },
    {
      question: 'Ứng dụng có thu phí người dùng không?',
      answer: 'Không, ứng dụng TeamZoneVN hoàn toàn miễn phí 100% đối với game thủ. Bạn có thể sử dụng đầy đủ các tính năng ghép phòng, chat nhóm, kết bạn và xem bảng xếp hạng mà không phải trả bất kỳ khoản phí nào.'
    },
    {
      question: 'TeamZoneVN xử lý người chơi toxic hoặc gian lận như thế nào?',
      answer: 'Chúng tôi có hệ thống báo cáo (Report) do các Admin kiểm duyệt 24/7. Đồng thời tích hợp cơ chế Cảnh cáo & Tự động khóa tài khoản lũy tiến: Bị cảnh cáo lần đầu sẽ bị hạn chế, 2-3 lần sẽ bị khóa tài khoản tạm thời (7-30 ngày), và trên 5 lần sẽ bị khóa tài khoản vĩnh viễn (Permanent Ban).'
    },
    {
      question: 'Ứng dụng có chạy trên cả điện thoại Android và iOS không?',
      answer: 'Có, ứng dụng di động TeamZoneVN được xây dựng trên nền tảng React Native/Expo, hỗ trợ đầy đủ và hiển thị mượt mà trên cả hệ điều hành Android và iOS (iPhone).'
    }
  ];

  const toggleFAQ = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section id="faq" className="py-28 bg-slate-950 relative overflow-hidden border-t border-slate-900">
      {/* Background gradient orb */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <HelpCircle className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-5xl font-heading text-white mb-4">
              CÂU HỎI <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">THƯỜNG GẶP</span>
            </h2>
            <p className="text-slate-400 font-body text-base max-w-xl mx-auto">
              Giải đáp nhanh những thắc mắc của bạn về nền tảng tìm bạn chơi game TeamZoneVN.
            </p>
          </motion.div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={`border rounded-2xl overflow-hidden transition-colors ${
                  isOpen
                    ? 'bg-slate-900/50 border-primary/20'
                    : 'bg-slate-900/20 border-slate-900 hover:border-slate-800'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className={`font-heading text-sm md:text-base transition-colors ${
                    isOpen ? 'text-primary' : 'text-slate-200'
                  }`}>
                    {faq.question}
                  </span>
                  <div className={`p-1.5 rounded-lg border transition-colors ${
                    isOpen ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 border-t border-slate-900/80 font-body text-sm md:text-[15px] text-slate-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
