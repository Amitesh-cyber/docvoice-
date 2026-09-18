import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import DocVoiceLogo from './DocVoiceLogo';

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const token = localStorage.getItem('token');
  let email = 'user@example.com';
  let name = 'User';
  let initial = 'U';
  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded.sub) {
        email = decoded.sub;
        name = email.split('@')[0];
        // Capitalize first letter
        name = name.charAt(0).toUpperCase() + name.slice(1);
        initial = name.charAt(0).toUpperCase();
      }
    } catch (e) {
      console.error("Invalid token");
    }
  }

  return (
    <div className="min-h-screen bg-[#13111C] flex font-sans text-white selection:bg-[#7c3aed]/30">
      {/* Sidebar Navigation */}
      <div className="w-[260px] bg-[#1a1728] border-r border-white/5 hidden md:flex flex-col h-screen fixed">
        <div className="px-6 pt-6 pb-8">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <DocVoiceLogo size="sm" />
          </Link>
        </div>
        <nav className="flex-1 space-y-1">
          <Link to="/dashboard" className={`flex items-center gap-3 px-6 h-[48px] font-medium transition-all ${location.pathname === '/dashboard' ? 'bg-[#7c3aed]/20 text-white border-l-[3px] border-[#7c3aed]' : 'text-[#a1a1aa] hover:bg-[#7c3aed]/10 hover:text-white border-l-[3px] border-transparent'}`}>
            <LayoutDashboard className="w-[20px] h-[20px]" />
            <span className="text-[14px]">Dashboard</span>
          </Link>
          <Link to="/documents" className={`flex items-center gap-3 px-6 h-[48px] font-medium transition-all ${location.pathname === '/documents' ? 'bg-[#7c3aed]/20 text-white border-l-[3px] border-[#7c3aed]' : 'text-[#a1a1aa] hover:bg-[#7c3aed]/10 hover:text-white border-l-[3px] border-transparent'}`}>
            <FileText className="w-[20px] h-[20px]" />
            <span className="text-[14px]">My Documents</span>
          </Link>
          <Link to="/settings" className={`flex items-center gap-3 px-6 h-[48px] font-medium transition-all ${location.pathname === '/settings' ? 'bg-[#7c3aed]/20 text-white border-l-[3px] border-[#7c3aed]' : 'text-[#a1a1aa] hover:bg-[#7c3aed]/10 hover:text-white border-l-[3px] border-transparent'}`}>
            <Settings className="w-[20px] h-[20px]" />
            <span className="text-[14px]">Settings</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 h-[48px] font-medium transition-all text-[#a1a1aa] hover:bg-[#7c3aed]/10 hover:text-white border-l-[3px] border-transparent">
            <LogOut className="w-[20px] h-[20px]" />
            <span className="text-[14px]">Logout</span>
          </button>
        </nav>
        <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7c3aed] flex items-center justify-center text-white font-bold">
            {initial}
          </div>
          <div className="flex flex-col">
            <span className="text-white text-sm font-semibold truncate max-w-[150px]">{name}</span>
            <span className="text-[#a1a1aa] text-xs truncate max-w-[150px]">{email}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden bg-[#1a1728] border-b border-white/5 p-4 flex justify-between items-center">
          <Link to="/">
            <DocVoiceLogo size="sm" />
          </Link>
          <button onClick={handleLogout} className="text-[#a1a1aa] hover:text-white"><LogOut className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 p-[40px] md:px-[48px] max-w-[1200px]">
          {children}
        </div>
      </div>
    </div>
  );
}
