import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api/axiosConfig';
import DocVoiceLogo from '../components/DocVoiceLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google', { credential: credentialResponse.credential });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Google login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#13111C] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#7c3aed] filter blur-[120px] opacity-[0.08] rounded-full pointer-events-none translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#4f46e5] filter blur-[100px] opacity-[0.06] rounded-full pointer-events-none -translate-x-1/4 translate-y-1/4" />

      <div className="w-full max-w-[420px] bg-[#1e1b4b] border border-[#7c3aed]/25 px-[48px] py-[48px] rounded-[24px] shadow-[0_40px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(124,58,237,0.1)] z-10 relative">
        <div className="flex flex-col items-center text-center mb-[32px]">
          <div className="scale-125 mb-6">
            <DocVoiceLogo size="sm" />
          </div>
          <h2 className="text-[28px] font-extrabold text-white mb-2">Welcome back</h2>
          <p className="text-[14px] text-[#a1a1aa]">Sign in to continue listening</p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-md p-3 text-center">
            {error}
          </div>
        )}

        <div className="mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="filled_black"
            size="large"
            shape="rectangular"
            text="continue_with"
            width="100%"
          />
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="text-[#a1a1aa] text-[13px]">or</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <input 
              type="email" 
              required 
              className="w-full px-4 py-[14px] bg-[#0f0f23] border border-white/10 rounded-[12px] text-white text-[15px] placeholder-[#4b5563] focus:outline-none focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all" 
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <input 
              type="password" 
              required 
              className="w-full px-4 py-[14px] bg-[#0f0f23] border border-white/10 rounded-[12px] text-white text-[15px] placeholder-[#4b5563] focus:outline-none focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full flex justify-center py-[14px] px-4 border border-transparent text-[15px] font-bold rounded-[12px] text-white bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(124,58,237,0.4)] transition-all"
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[14px] text-[#a1a1aa]">
            Don't have an account? <Link to="/signup" className="text-[#a78bfa] hover:underline font-medium ml-1">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
