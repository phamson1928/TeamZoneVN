
import Hero from './components/Hero';
import Features from './components/Features';
import CTA from './components/CTA';
import logo from './assets/logo.png';

function App() {
  return (
    <div className="font-body bg-slate-950 text-white min-h-screen relative">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center gap-3">
          <img src={logo} alt="TeamZoneVN Logo" className="h-10 md:h-12 object-contain" />
          <span className="font-heading text-2xl md:text-3xl text-white tracking-wide">TeamZoneVN</span>
        </div>
      </header>

      <Hero />
      <Features />
      <CTA />
      
      {/* Footer */}
      <footer className="bg-slate-950 py-8 border-t border-slate-900 text-center text-slate-500 font-body text-sm flex flex-col gap-2">
        <p>&copy; {new Date().getFullYear()} TeamZoneVN. Bảo lưu mọi quyền.</p>
        <p>Liên hệ: <a href="mailto:pson4282@gmail.com" className="text-primary hover:text-secondary transition-colors">pson4282@gmail.com</a></p>
      </footer>
    </div>
  );
}

export default App;
