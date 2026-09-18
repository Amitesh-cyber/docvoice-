import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import DashboardLayout from '../components/DashboardLayout';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reprocessingDocs, setReprocessingDocs] = useState({});
  const pollingIntervalsRef = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
    return () => {
      // Clear all active intervals on unmount
      Object.values(pollingIntervalsRef.current).forEach(intervalId => clearInterval(intervalId));
    };
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate('/login');
      } else {
        toast.error("Failed to load documents.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReprocess = async (docId) => {
    setReprocessingDocs(prev => ({ ...prev, [docId]: true }));
    // Update local card status to PROCESSING immediately
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'PROCESSING', errorMessage: null } : d));

    try {
      await api.post(`/admin/reprocess/${docId}`);
      toast.success("Retry initiated. Polling status...");

      // Poll every 2 seconds
      const intervalId = setInterval(async () => {
        try {
          const res = await api.get(`/documents/${docId}`);
          const updatedDoc = res.data;

          if (updatedDoc && (updatedDoc.status === 'READY' || updatedDoc.status === 'FAILED')) {
            clearInterval(intervalId);
            delete pollingIntervalsRef.current[docId];
            setReprocessingDocs(prev => {
              const next = { ...prev };
              delete next[docId];
              return next;
            });

            // Update doc card
            setDocuments(prev => prev.map(d => d.id === docId ? updatedDoc : d));

            if (updatedDoc.status === 'READY') {
              toast.success(`"${updatedDoc.filename}" is now ready!`);
            } else {
              toast.error(`Processing failed: ${updatedDoc.errorMessage || 'Unknown error'}`);
            }
          }
        } catch (pollErr) {
          console.error("Polling error", pollErr);
        }
      }, 2000);

      pollingIntervalsRef.current[docId] = intervalId;

    } catch (err) {
      toast.error("Failed to trigger retry processing.");
      setReprocessingDocs(prev => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
      fetchDocuments();
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      return (
        <div className="w-[40px] h-[40px] bg-red-500/10 rounded-[10px] flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-red-500" />
        </div>
      );
    }
    if (ext === 'docx' || ext === 'doc') {
      return (
        <div className="w-[40px] h-[40px] bg-blue-500/10 rounded-[10px] flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-blue-500" />
        </div>
      );
    }
    if (ext === 'pptx' || ext === 'ppt') {
      return (
        <div className="w-[40px] h-[40px] bg-orange-500/10 rounded-[10px] flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-orange-500" />
        </div>
      );
    }
    return (
      <div className="w-[40px] h-[40px] bg-gray-500/10 rounded-[10px] flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-gray-400" />
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-[28px] font-extrabold text-white mb-2">My Documents</h1>
        <p className="text-[15px] text-[#a1a1aa]">Manage and listen to your uploaded files</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-[#1e1b4b] rounded-[20px] border border-[#7c3aed]/20 p-[48px] text-center flex flex-col items-center">
          <FileText className="w-[48px] h-[48px] text-gray-500 mb-4" />
          <h3 className="text-[16px] text-white font-medium mb-1">No documents yet</h3>
          <p className="text-[#a1a1aa] text-[14px] mb-6">Upload your first document to get started</p>
          <button onClick={() => navigate('/dashboard')} className="bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-[12px] px-[24px] py-[10px] text-white font-bold">
            Go to Upload
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
          {documents.map(doc => {
            const isReprocessing = reprocessingDocs[doc.id];

            return (
              <div 
                key={doc.id} 
                onClick={() => doc.status === 'READY' && navigate(`/reader/${doc.id}`)} 
                className={`bg-[#1e1b4b] border border-[#7c3aed]/15 rounded-[16px] p-[20px] transition-all duration-300 flex flex-col h-full ${
                  doc.status === 'READY' ? 'cursor-pointer hover:border-[#7c3aed]/50 hover:-translate-y-[4px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)]' : ''
                }`}
              >
                
                <div className="flex items-start gap-4 mb-4">
                  {getFileIcon(doc.filename)}
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-[14px] font-bold text-white truncate mb-1" title={doc.filename}>{doc.filename}</h3>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[#a1a1aa] text-[12px]">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                      <span className="text-[#a1a1aa] text-[12px]">{doc.totalPages ? `${doc.totalPages} pages` : 'Calculating pages...'}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  {doc.status === 'READY' ? (
                    <span className="inline-block bg-emerald-500/15 text-emerald-500 rounded-[20px] px-[10px] py-[3px] text-[11px] font-medium">
                      Ready ✓
                    </span>
                  ) : doc.status === 'FAILED' && !isReprocessing ? (
                    <span className="inline-block bg-red-500/15 text-red-500 rounded-[20px] px-[10px] py-[3px] text-[11px] font-medium">
                      Failed ✗
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-500 rounded-[20px] px-[10px] py-[3px] text-[11px] font-medium">
                      <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                    </span>
                  )}

                  {doc.status === 'FAILED' && doc.errorMessage && (
                    <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="truncate" title={doc.errorMessage}>{doc.errorMessage}</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-white/5">
                  {doc.status === 'FAILED' ? (
                    <button 
                      disabled={isReprocessing}
                      onClick={(e) => { e.stopPropagation(); handleReprocess(doc.id); }}
                      className="w-full py-[8px] rounded-[10px] text-[13px] font-medium transition-all text-center border border-red-500/40 text-red-500 hover:bg-red-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isReprocessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                          <span>Retrying...</span>
                        </>
                      ) : (
                        <span>Retry Processing</span>
                      )}
                    </button>
                  ) : (
                    <button 
                      disabled={doc.status !== 'READY'}
                      className={`w-full py-[8px] rounded-[10px] text-[13px] font-medium transition-all text-center border ${
                        doc.status === 'READY' 
                          ? 'border-[#7c3aed]/40 text-[#a78bfa] hover:bg-[#7c3aed]/20' 
                          : 'border-white/10 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {doc.status === 'READY' ? 'Open' : 'Processing...'}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
