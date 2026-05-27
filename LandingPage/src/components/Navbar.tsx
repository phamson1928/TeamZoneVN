import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Download } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Sảnh Chờ', href: '#hero' },
    { label: 'Tính Năng', href: '#features' },
    { label: 'Trải Nghiệm', href: '#showcase' },
    { label: 'Hỏi Đáp', href: '#faq' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-7xl rounded-2xl border transition-all duration-300 ${
          isScrolled
            ? 'bg-slate-950/70 border-slate-800/80 shadow-2xl backdrop-blur-md py-3'
            : 'bg-transparent border-transparent py-5'
        }`}
      >
        <div className="px-6 md:px-8 flex items-center justify-between">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-3 group">
            <img
              src={logo}
              alt="TeamZoneVN Logo"
              className="h-9 md:h-11 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <span className="font-heading text-xl md:text-2xl text-white tracking-wider bg-clip-text">
              TeamZoneVN
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="font-body text-[15px] text-slate-300 hover:text-primary transition-colors tracking-wide relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary after:transition-all"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA Action button */}
          <div className="hidden md:flex items-center">
            <a
              href="#cta"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-heading text-xs hover:scale-105 transition-all shadow-md shadow-primary/20 hover:shadow-primary/40 border border-primary/20"
            >
              <Download className="w-4 h-4" />
              Tải Ứng Dụng
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-40 w-[92%] bg-slate-950/95 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-lg flex flex-col gap-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-body text-lg text-slate-200 hover:text-primary transition-colors py-2 border-b border-slate-900"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <a
              href="#cta"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-heading text-sm shadow-lg shadow-primary/20"
            >
              <Download className="w-5 h-5" />
              Tải Ứng Dụng
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
