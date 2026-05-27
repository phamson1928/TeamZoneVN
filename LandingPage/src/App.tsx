import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Features from './components/Features';
import AppShowcase from './components/AppShowcase';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import logo from './assets/logo.png';

function App() {
  return (
    <div className="font-body bg-[#090D1A] text-white min-h-screen relative selection:bg-primary/30 selection:text-white">
      {/* Background radial overlay */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0"></div>

      {/* Floating Navigation Bar */}
      <Navbar />

      {/* Sections */}
      <main>
        <Hero />
        <Stats />
        <Features />
        <AppShowcase />
        <FAQ />
        <CTA />
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-900/60 relative z-10 overflow-hidden">
        {/* Background glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TeamZoneVN Logo" className="h-9 w-auto object-contain" />
            <span className="font-heading text-lg text-white tracking-wide">TeamZoneVN</span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 font-body text-sm text-slate-400">
            <a href="#hero" className="hover:text-primary transition-colors">Trang Chủ</a>
            <a href="#features" className="hover:text-primary transition-colors">Tính Năng</a>
            <a href="#showcase" className="hover:text-primary transition-colors">Trải Nghiệm</a>
            <a href="#faq" className="hover:text-primary transition-colors">Hỏi Đáp</a>
            <a 
              href="#privacy" 
              onClick={(e) => {
                e.preventDefault();
                alert('Trang Chính sách Bảo mật (Privacy Policy) đang được cập nhật để phù hợp với chuẩn Store!');
              }}
              className="hover:text-primary transition-colors"
            >
              Bảo Mật
            </a>
          </div>

          <div className="text-center md:text-right font-body text-xs text-slate-500 flex flex-col gap-1">
            <p>&copy; {new Date().getFullYear()} TeamZoneVN. Bảo lưu mọi quyền.</p>
            <p>
              Liên hệ hợp tác:{' '}
              <a href="mailto:pson4282@gmail.com" className="text-slate-400 hover:text-primary transition-colors font-medium">
                pson4282@gmail.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
