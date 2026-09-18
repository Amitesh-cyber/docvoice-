import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axiosConfig';
import DashboardLayout from '../components/DashboardLayout';

export default function Dashboard() {
  const [isUploading, setIsUploading] = useState(false);
  const [userName, setUserName] = useState('User');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.sub) {
          let name = decoded.sub.split('@')[0];
          name = name.charAt(0).toUpperCase() + name.slice(1);
          setUserName(name);
        }
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    const loadingToast = toast.loading("Uploading document...", { style: { background: '#1e1b4b', color: '#fff', border: '1px solid rgba(124,58,237,0.3)' } });

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Upload successful!', { id: loadingToast, style: { background: '#1e1b4b', color: '#fff', border: '1px solid rgba(124,58,237,0.3)' } });
      // Redirect to documents page after successful upload
      navigate('/documents');
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.", { id: loadingToast, style: { background: '#1e1b4b', color: '#fff', border: '1px solid rgba(124,58,237,0.3)' } });
        navigate('/login');
      } else {
        toast.error(err.response?.data || 'Upload failed due to a server error.', { id: loadingToast, style: { background: '#1e1b4b', color: '#fff', border: '1px solid rgba(124,58,237,0.3)' } });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, disabled: isUploading });

  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-[28px] font-extrabold text-white mb-2">Welcome back, {userName} 👋</h1>
        <p className="text-[15px] text-[#a1a1aa]">Ready to listen to something new today?</p>
      </div>
      
      {/* Advanced Dropzone */}
      <div 
        {...getRootProps()} 
        className={`bg-[#1e1b4b] border-[2px] border-dashed rounded-[20px] py-[56px] px-[40px] text-center cursor-pointer transition-all duration-300 ease-in-out mb-[40px] ${isDragActive ? 'border-[#7c3aed] bg-[#7c3aed]/10 scale-[1.005]' : 'border-[#7c3aed]/35 hover:border-[#7c3aed] hover:bg-[#7c3aed]/10 hover:scale-[1.005]'}`}
      >
        <input {...getInputProps()} />
        
        <div className="bg-[#7c3aed]/15 rounded-[16px] p-[20px] w-fit mx-auto mb-[20px]">
          <UploadCloud className="w-[48px] h-[48px] text-[#7c3aed]" />
        </div>
        
        <h3 className="text-[18px] font-bold text-white mb-2">
          {isDragActive ? "Drop it like it's hot!" : "Drag and drop your file here"}
        </h3>
        <p className="text-[#a1a1aa] text-[14px]">
          Supports PDF, DOCX, PPTX, and TXT files up to 50MB
        </p>
        <p className="text-[#a1a1aa] text-[13px] mt-[16px]">or</p>
        
        <button type="button" className="mt-[12px] bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-[12px] px-[32px] py-[12px] text-white font-bold hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(124,58,237,0.4)] transition-all pointer-events-none">
          Browse Files
        </button>
      </div>
    </DashboardLayout>
  );
}
