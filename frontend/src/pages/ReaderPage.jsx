import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Pause, MessageSquare, ChevronLeft, Volume2, Sparkles, Languages, FileText, RefreshCw, Gauge } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import DocVoiceLogo from '../components/DocVoiceLogo';
import './ReaderPage.css';

export default function ReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Document State
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [language, setLanguage] = useState('en');
  
  // Audio State (Web Speech API)
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [speechMode, setSpeechMode] = useState('page'); // 'page' or 'summary'
  
  // Summary loading state
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Ask AI State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef(null);

  // Refs for 3D Tilt
  const leftCardRef = useRef(null);
  const audioCardRef = useRef(null);
  const askAiCardRef = useRef(null);

  const langMap = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'bn': 'bn-IN',
    'mr': 'mr-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'ja': 'ja-JP',
    'ar': 'ar-SA',
  };

  useEffect(() => {
    fetchPages();
  }, [id]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // When page changes, stop speech:
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, [currentPageIndex]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const fetchPages = async () => {
    try {
      const res = await api.get(`/reader/document/${id}/pages`);
      setPages(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const cleanText = (text) => {
    if (!text) return '';
    return text.replace(/[*_#`~>]/g, '').trim();
  };

  const currentPage = pages[currentPageIndex];

  const handleGenerateSummary = async () => {
    if (!currentPage) return;
    setIsSummaryLoading(true);
    try {
      const res = await api.post(`/reader/page/${currentPage.id}/summary`);
      const updatedSummary = res.data.summary;
      setPages(prev => prev.map((p, idx) => idx === currentPageIndex ? { ...p, summaryText: updatedSummary } : p));
      toast.success("Summary generated successfully!");
    } catch (err) {
      toast.error("Failed to generate summary: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const speakText = (text, langCode, speed = playbackSpeed) => {
    if (!('speechSynthesis' in window)) {
      toast.error("Speech synthesis is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const textToRead = cleanText(text);
    if (!textToRead) {
      toast("No text available to speak.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = langMap[langCode] || 'en-US';
    utterance.rate = speed || 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      console.log('Speech started');
    };

    utterance.onend = () => {
      setIsPlaying(false);
      console.log('Speech ended');
    };

    utterance.onerror = (e) => {
      setIsPlaying(false);
      console.error('Speech error:', e);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (!('speechSynthesis' in window)) {
      toast.error("Speech synthesis is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        const textToSpeak = speechMode === 'summary' && currentPage?.summaryText
          ? currentPage.summaryText
          : (currentPage?.originalText || '');
        speakText(textToSpeak, language);
      }
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      const textToSpeak = speechMode === 'summary' && currentPage?.summaryText
        ? currentPage.summaryText
        : (currentPage?.originalText || '');
      speakText(textToSpeak, language, speed);
    }
  };

  const askQuestion = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMsg = { role: 'user', content: chatInput };
    const updatedHistory = [...chatHistory, userMsg];
    
    setChatHistory(updatedHistory);
    setChatInput('');
    setIsChatLoading(true);
    
    const recentHistory = updatedHistory.slice(-5);
    
    try {
      const res = await api.post(`/reader/document/${id}/qa`, { 
        question: userMsg.content,
        history: recentHistory.slice(0, -1)
      });
      setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch (err) {
      console.error('Failed to get answer', err);
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleMouseMove = (e, ref) => {
    if (!ref.current) return;
    const card = ref.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (y / (rect.height / 2)) * -5;
    const rotateY = (x / (rect.width / 2)) * 5;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    card.style.transition = 'transform 0.1s ease-out';
  };

  const handleMouseLeave = (ref) => {
    if (!ref.current) return;
    const card = ref.current;
    card.style.transform = '';
    card.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  };

  return (
    <div className="reader-page-wrapper" style={{ background: '#13111C' }}>
      <div className="reader-content-z flex flex-col h-screen">
        {/* Top Navbar */}
        <nav className="border-b border-white/10 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shrink-0" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-4">
            <Link to="/documents" className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-white/20" />
            <DocVoiceLogo size="sm" />
          </div>
        </nav>

        <div className="flex-1 w-full mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-73px)]">
          
          {/* Left: Text Viewer */}
          <div 
            ref={leftCardRef}
            onMouseMove={(e) => handleMouseMove(e, leftCardRef)}
            onMouseLeave={() => handleMouseLeave(leftCardRef)}
            className="flex-1 flex flex-col overflow-hidden h-full floating-card"
            style={{ background: '#1e1b4b', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <div className="border-b border-white/10 px-6 py-4 flex justify-between items-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h2 className="font-semibold text-white flex items-center gap-3">
                <FileText className="w-4 h-4 text-[#7c3aed]" />
                <span className="flex items-center gap-2">
                  <span style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }} className="text-white rounded-[20px] px-4 py-1 text-sm font-bold">
                    Page {currentPage?.pageNumber || 1}
                  </span>
                  <span className="text-white/40 font-normal text-sm">of {pages.length}</span>
                </span>
              </h2>
              <div className="flex gap-2">
                 <button 
                  disabled={currentPageIndex === 0} 
                  onClick={() => setCurrentPageIndex(prev => prev - 1)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-30 transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}
                 >
                   Prev
                 </button>
                 <button 
                  disabled={currentPageIndex === pages.length - 1} 
                  onClick={() => setCurrentPageIndex(prev => prev + 1)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-30 transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}
                 >
                   Next
                 </button>
              </div>
            </div>
            <div key={currentPageIndex} className="p-8 overflow-y-auto flex-1 flex flex-col gap-8 page-content-animated">
              <div className="prose prose-lg max-w-none prose-p:leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {currentPage ? currentPage.originalText : (
                  <div className="flex items-center justify-center h-full space-x-2 py-12">
                    <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                )}
              </div>
              
              {/* Summary Block */}
              <div className="mt-auto">
                <div className="w-full h-px mb-6" style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.5), transparent)' }} />
                {currentPage?.summaryText ? (
                  <div className="p-6" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '16px', borderLeft: '3px solid #7c3aed' }}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2" style={{ color: '#a78bfa' }}>
                        <Sparkles className="w-4 h-4" /> AI Summary
                      </h3>
                      <button 
                        onClick={handleGenerateSummary} 
                        disabled={isSummaryLoading}
                        className="text-xs text-[#a78bfa] hover:text-white flex items-center gap-1 opacity-80 hover:opacity-100"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSummaryLoading ? 'animate-spin' : ''}`} /> Refresh
                      </button>
                    </div>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap font-sans" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {cleanText(currentPage.summaryText)}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center justify-between rounded-xl" style={{ background: 'rgba(124,58,237,0.05)', border: '1px dashed rgba(124,58,237,0.3)' }}>
                    <span className="text-sm text-[#a78bfa]/80 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#7c3aed]" /> No summary generated for this page yet.
                    </span>
                    <button
                      onClick={handleGenerateSummary}
                      disabled={isSummaryLoading}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50"
                    >
                      {isSummaryLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Generate Summary
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Tools Panel */}
          <div className="w-full lg:w-[450px] flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-4">
            
            {/* Section 1: Audio Player (Web Speech API) */}
            <div 
              ref={audioCardRef}
              onMouseMove={(e) => handleMouseMove(e, audioCardRef)}
              onMouseLeave={() => handleMouseLeave(audioCardRef)}
              className="p-5 flex flex-col shrink-0 floating-card-right"
              style={{ background: '#1e1b4b', border: '1px solid rgba(124,58,237,0.2)' }}
            >
              <div className="flex items-center justify-between mb-4">
                 <div>
                   <h3 className="font-semibold text-white flex items-center gap-2">
                     <Volume2 className="w-5 h-5 text-[#7c3aed]" /> Audio Reader
                   </h3>
                   <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider mt-1 block">Zero Latency Browser TTS</span>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1.5"
                      style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: '20px', color: '#a78bfa' }}>
                   <Languages className="w-4 h-4" />
                   <select 
                     value={language} 
                     onChange={(e) => {
                       const newLang = e.target.value;
                       setLanguage(newLang);
                       if (isPlaying) {
                         const textToSpeak = speechMode === 'summary' && currentPage?.summaryText
                           ? currentPage.summaryText
                           : (currentPage?.originalText || '');
                         speakText(textToSpeak, newLang);
                       }
                     }}
                     className="bg-transparent text-xs font-semibold outline-none cursor-pointer pr-1"
                   >
                     <option value="en" className="text-gray-900">English (en-US)</option>
                     <option value="hi" className="text-gray-900">Hindi (hi-IN)</option>
                     <option value="ta" className="text-gray-900">Tamil (ta-IN)</option>
                     <option value="te" className="text-gray-900">Telugu (te-IN)</option>
                     <option value="bn" className="text-gray-900">Bengali (bn-IN)</option>
                     <option value="mr" className="text-gray-900">Marathi (mr-IN)</option>
                     <option value="gu" className="text-gray-900">Gujarati (gu-IN)</option>
                     <option value="kn" className="text-gray-900">Kannada (kn-IN)</option>
                     <option value="ml" className="text-gray-900">Malayalam (ml-IN)</option>
                     <option value="pa" className="text-gray-900">Punjabi (pa-IN)</option>
                     <option value="es" className="text-gray-900">Spanish (es-ES)</option>
                     <option value="fr" className="text-gray-900">French (fr-FR)</option>
                     <option value="de" className="text-gray-900">German (de-DE)</option>
                     <option value="ja" className="text-gray-900">Japanese (ja-JP)</option>
                     <option value="ar" className="text-gray-900">Arabic (ar-SA)</option>
                   </select>
                 </div>
              </div>

              {/* Speech Mode Toggle: Page Text vs Summary */}
              <div className="flex bg-black/20 rounded-xl p-1 mb-4 border border-white/5">
                <button
                  onClick={() => {
                    setSpeechMode('page');
                    if (isPlaying) {
                      speakText(currentPage?.originalText || '', language);
                    }
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    speechMode === 'page'
                      ? 'bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Read Page
                </button>
                <button
                  onClick={() => {
                    setSpeechMode('summary');
                    if (isPlaying) {
                      speakText(currentPage?.summaryText || currentPage?.originalText || '', language);
                    }
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    speechMode === 'summary'
                      ? 'bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Read Summary
                </button>
              </div>

              {/* Animated Waveform */}
              <div className="h-10 flex items-center justify-center gap-1.5 overflow-hidden my-2">
                 {[...Array(16)].map((_, i) => (
                   <div 
                     key={i} 
                     className={`waveform-bar ${isPlaying ? 'playing' : ''}`}
                     style={{ 
                       height: isPlaying ? `${Math.max(6, (Math.sin(i * 0.8 + Date.now()) * 18) + 20)}px` : '4px',
                       width: '3px',
                       borderRadius: '2px',
                       background: isPlaying ? 'linear-gradient(to top, #7c3aed, #ec4899)' : 'rgba(255,255,255,0.2)',
                       transition: 'height 0.15s ease'
                     }}
                   />
                 ))}
              </div>

              {/* Play / Pause Button */}
              <div className="flex justify-center my-3">
                <button 
                  onClick={handlePlay}
                  className="flex items-center justify-center transition-all duration-300"
                  style={{ 
                    width: '68px', height: '68px', 
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', 
                    borderRadius: '50%', 
                    boxShadow: '0 0 0 8px rgba(124,58,237,0.15), 0 0 0 16px rgba(124,58,237,0.08), 0 15px 40px rgba(124,58,237,0.5)'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 fill-current text-white" />
                  ) : (
                    <Play className="w-8 h-8 fill-current text-white ml-1" />
                  )}
                </button>
              </div>

              {/* Speed Controls: 0.5x 0.75x 1x 1.25x 1.5x 2x */}
              <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> Playback Speed</span>
                  <span className="text-[#a78bfa] font-bold">{playbackSpeed}x</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={`flex-1 py-1 rounded-md text-xs font-semibold transition-all ${
                        playbackSpeed === spd
                          ? 'bg-[#7c3aed] text-white shadow'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Ask AI Chat */}
            <div 
              ref={askAiCardRef}
              onMouseMove={(e) => handleMouseMove(e, askAiCardRef)}
              onMouseLeave={() => handleMouseLeave(askAiCardRef)}
              className="p-5 flex flex-col h-[380px] shrink-0 floating-card-right"
              style={{ background: '#1e1b4b', border: '1px solid rgba(124,58,237,0.2)' }}
            >
              <div className="mb-4">
                <h3 className="font-semibold flex items-center gap-2 text-[#a78bfa]">
                  <MessageSquare className="w-5 h-5 text-[#a78bfa]" /> 
                  <span>Ask AI</span>
                </h3>
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider mt-1 block">Powered by Gemini 2.0</span>
              </div>
              
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto mb-4 p-4 flex flex-col gap-4 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                {chatHistory.length === 0 ? (
                  <div className="text-center text-white/40 text-sm mt-10">
                    Ask me to explain concepts, summarize paragraphs, or find facts in this document!
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className="px-5 py-3 text-sm max-w-[85%] whitespace-pre-wrap"
                           style={msg.role === 'user' ? {
                             background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                             color: 'white',
                             borderRadius: '18px 18px 4px 18px',
                             boxShadow: '0 4px 15px rgba(124,58,237,0.3)'
                           } : {
                             background: 'rgba(255,255,255,0.06)',
                             border: '1px solid rgba(255,255,255,0.1)',
                             color: 'rgba(255,255,255,0.85)',
                             borderRadius: '18px 18px 18px 4px'
                           }}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {isChatLoading && (
                  <div className="flex justify-start">
                     <div className="px-5 py-3 shadow-sm flex gap-1 items-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px 18px 18px 4px' }}>
                       <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                       <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                       <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                     </div>
                  </div>
                )}
              </div>
              
              <form onSubmit={askQuestion} className="flex gap-3">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..." 
                  className="flex-1 px-4 py-3 outline-none transition-all"
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '16px', 
                    color: 'white' 
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.2)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = ''; }}
                />
                <button 
                  type="submit" 
                  disabled={isChatLoading || !chatInput.trim()} 
                  className="px-6 py-3 font-semibold text-white disabled:opacity-50 transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderRadius: '12px', boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(124,58,237,0.5)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 15px rgba(124,58,237,0.4)'; }}
                >
                  Send
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
