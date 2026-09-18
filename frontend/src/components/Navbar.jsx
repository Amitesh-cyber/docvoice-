import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import DocVoiceLogo from './DocVoiceLogo';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 h-[64px] px-4 md:px-[48px] flex items-center bg-[#13111C] border-b border-white/5`}>
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center w-full">
          <Link to="/" className="flex items-center gap-2 group transform hover:scale-105 transition-transform duration-300">
            <DocVoiceLogo size="sm" />
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" onClick={(e) => handleScrollTo(e, 'features')} className="text-[14px] font-medium text-white hover:text-[#7c3aed] transition-colors cursor-pointer">Features</a>
            <a href="#how-it-works" onClick={(e) => handleScrollTo(e, 'how-it-works')} className="text-[14px] font-medium text-white hover:text-[#7c3aed] transition-colors cursor-pointer">How It Works</a>
            <a href="#languages" onClick={(e) => handleScrollTo(e, 'languages')} className="text-[14px] font-medium text-white hover:text-[#7c3aed] transition-colors cursor-pointer">Languages</a>
            <a href="#about" onClick={(e) => handleScrollTo(e, 'about')} className="text-[14px] font-medium text-white hover:text-[#7c3aed] transition-colors cursor-pointer">About</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-[14px] font-medium text-white bg-transparent hover:text-[#7c3aed] transition-colors">
              Login
            </Link>
            <Link to="/signup" className="text-[14px] font-bold bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white px-6 py-2.5 rounded-[25px] hover:opacity-90 transition-all shadow-[0_8px_24px_rgba(124,58,237,0.4)] hover:-translate-y-[2px]">
              Start for Free ▶
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:text-[#7c3aed] transition-colors">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-[64px] left-0 w-full bg-[#13111C] border-b border-white/5 py-4 px-6 flex flex-col gap-4 md:hidden shadow-xl">
          <a href="#features" onClick={(e) => handleScrollTo(e, 'features')} className="text-white hover:text-[#7c3aed] py-2 border-b border-white/5">Features</a>
          <a href="#how-it-works" onClick={(e) => handleScrollTo(e, 'how-it-works')} className="text-white hover:text-[#7c3aed] py-2 border-b border-white/5">How It Works</a>
          <a href="#languages" onClick={(e) => handleScrollTo(e, 'languages')} className="text-white hover:text-[#7c3aed] py-2 border-b border-white/5">Languages</a>
          <a href="#about" onClick={(e) => handleScrollTo(e, 'about')} className="text-white hover:text-[#7c3aed] py-2 border-b border-white/5">About</a>
          <div className="flex flex-col gap-3 mt-2">
            <Link to="/login" className="text-center text-white border border-white/20 rounded-lg py-2 hover:bg-white/5">Login</Link>
            <Link to="/signup" className="text-center text-white bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-lg py-2 font-bold">Start for Free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
