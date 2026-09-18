import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Clock, LayoutDashboard, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/history');
      setHistory(res.data);
    } catch (err) {
      toast.error('Failed to load history');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Simple Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0d9488] to-[#6366f1] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold font-sans">D</span>
            </div>
            <span className="text-xl font-bold font-sans tracking-tight text-gray-900">DocVoice</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/history" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium bg-[#0d9488]/10 text-[#0d9488]">
            <Clock className="w-5 h-5" /> History
          </Link>
        </nav>
      </div>

      <div className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8">Listening History</h1>
        {history.length === 0 ? (
          <p className="text-gray-500">No history yet. Start listening to some documents!</p>
        ) : (
          <div className="grid gap-6">
            {history.map(h => (
              <div key={h.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{h.document?.filename || 'Unknown Document'}</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Last listened: {new Date(h.lastListenedAt).toLocaleDateString()} • Left off on page {h.lastPage}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">Total time: {Math.floor(h.totalTimeSeconds / 60)} minutes</p>
                </div>
                <Link to={'/reader/' + (h.document?.id || '')} className="flex items-center gap-2 bg-[#0d9488] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#0f766e]">
                  <PlayCircle className="w-5 h-5" /> Resume
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
