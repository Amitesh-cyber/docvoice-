import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Bookmark, LayoutDashboard, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/bookmarks');
      setBookmarks(res.data);
    } catch (err) {
      toast.error('Failed to load bookmarks');
    }
  };

  const deleteBookmark = async (id) => {
    try {
      await api.delete('/bookmarks/' + id);
      setBookmarks(bookmarks.filter(b => b.id !== id));
      toast.success('Bookmark deleted');
    } catch (err) {
      toast.error('Failed to delete bookmark');
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
          <Link to="/bookmarks" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium bg-[#0d9488]/10 text-[#0d9488]">
            <Bookmark className="w-5 h-5" /> Bookmarks
          </Link>
        </nav>
      </div>

      <div className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8">My Bookmarks</h1>
        {bookmarks.length === 0 ? (
          <p className="text-gray-500">No bookmarks yet. Go to the reader to add some!</p>
        ) : (
          <div className="grid gap-6">
            {bookmarks.map(b => (
              <div key={b.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold text-[#0d9488] bg-[#0d9488]/10 px-3 py-1 rounded-full">
                    Page {b.pageNumber}
                  </span>
                  <button onClick={() => deleteBookmark(b.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <blockquote className="text-gray-700 italic border-l-4 border-[#0d9488] pl-4">"{b.sentenceText}"</blockquote>
                {b.personalNote && (
                  <div className="bg-gray-50 p-4 rounded-xl text-gray-600 text-sm">
                    <strong>Note:</strong> {b.personalNote}
                  </div>
                )}
                <Link to={'/reader/' + (b.document?.id || '')} className="text-sm font-medium text-[#6366f1] hover:underline">
                  Go to Document ?
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
