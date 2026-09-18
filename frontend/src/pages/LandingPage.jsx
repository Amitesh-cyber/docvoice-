import { Link } from 'react-router-dom';
import { Volume2, Sparkles, FileText, MessageSquare, Upload, Globe2, Headphones, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#13111C] font-sans selection:bg-[#7c3aed]/30 text-white overflow-hidden">
      <Navbar />

      {/* HERO SECTION */}
      <section className="min-h-[90vh] flex flex-col md:flex-row items-center px-8 md:px-[80px] py-[80px] max-w-[1440px] mx-auto pt-[120px]">
        <div className="w-full md:w-1/2 flex flex-col items-start text-left z-10">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-[#7c3aed]/40 bg-[#7c3aed]/15 text-[#a78bfa] text-[13px] font-medium">
            ✨ AI-Powered Document Reader
          </div>
          <h1 className="text-[40px] md:text-[56px] font-extrabold leading-[1.1] text-white mb-6">
            Turn any document<br/>
            into your personal<br/>
            <span className="text-[#7c3aed]">audiobook</span>
          </h1>
          <p className="text-[#a1a1aa] text-[16px] leading-[1.7] max-w-[440px] mb-6">
            Upload PDFs, Word docs, or PowerPoints.<br/>
            Get AI summaries and listen in 50+<br/>
            languages including Hindi, Tamil, and more.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <Link to="/signup" className="px-8 py-3.5 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-full text-white font-bold text-[16px] shadow-[0_8px_32px_rgba(124,58,237,0.4)] hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(124,58,237,0.5)] transition-all">
              Get Started Free ▶
            </Link>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center items-center relative mt-16 md:mt-0">
          <style>{`
            @keyframes floatCard {
              0%,100% { transform: translateY(0px) rotate(-1deg); }
              50% { transform: translateY(-16px) rotate(1deg); }
            }
            @keyframes audioWave {
              0%,100% { transform: scaleY(1); }
              50% { transform: scaleY(0.3); }
            }
            @keyframes float {
              0%,100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
          
          <div className="relative w-full max-w-[480px] h-[420px] flex items-center justify-center">
            {/* Background glow */}
            <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.2) 0%, transparent 65%)' }} />

            {/* Floating Badges */}
            <div className="hidden md:flex absolute top-[20px] right-[-20px] bg-[#10b981]/15 border border-[#10b981]/30 rounded-[20px] px-[14px] py-[7px] items-center gap-[6px] z-20" style={{ animation: 'float 3s ease-in-out infinite' }}>
              <div className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
              <span className="text-[#10b981] text-[11px] font-bold">AI Summary Ready</span>
            </div>
            
            <div className="hidden md:flex absolute bottom-[30px] left-[-30px] bg-[#1e1b4b]/95 border border-[#7c3aed]/30 rounded-[16px] px-[16px] py-[10px] items-center gap-2 z-20" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '1.2s' }}>
              <Globe2 className="w-3 h-3 text-[#7c3aed]" />
              <div className="flex flex-col">
                <span className="text-white text-[12px] font-bold leading-tight">Hindi</span>
                <span className="text-[#7c3aed] text-[10px] leading-tight">Translation Active</span>
              </div>
            </div>

            <div className="hidden md:flex absolute top-[40px] left-[-20px] bg-[#1e1b4b]/95 border border-[#7c3aed]/30 rounded-[14px] px-[14px] py-[8px] items-center gap-2 z-20" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '0.6s' }}>
              <FileText className="w-3 h-3 text-[#7c3aed]" />
              <span className="text-white text-[11px] font-bold">PDF Uploaded ✓</span>
            </div>

            <div className="hidden md:flex absolute bottom-[60px] right-[-20px] bg-[#f59e0b]/12 border border-[#f59e0b]/25 rounded-[14px] px-[14px] py-[8px] z-20" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '1.8s' }}>
              <span className="text-[#f59e0b] text-[10px] font-bold">⚡ Page cached</span>
            </div>

            {/* MAIN FLOATING CARD */}
            <div className="relative bg-[#1e1b4b]/90 border border-[#7c3aed]/30 rounded-[24px] p-[24px] w-[90%] md:w-[380px] z-10 shadow-[0_40px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(124,58,237,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]" style={{ animation: 'floatCard 5s ease-in-out infinite' }}>
              
              {/* CARD HEADER */}
              <div className="bg-[#0f0f23]/80 rounded-t-[12px] px-[16px] py-[10px] flex items-center gap-[8px]">
                <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
                <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
                <div className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
                <div className="flex-1 bg-white/5 rounded-[6px] px-[12px] py-[4px] text-white/30 text-[11px] ml-2">
                  docvoice.app/reader
                </div>
              </div>

              {/* CARD BODY */}
              <div className="flex gap-[16px] p-[16px] bg-[#0f0f23]/50 rounded-b-[16px]">
                
                {/* LEFT COLUMN */}
                <div className="w-[60%] flex flex-col items-start">
                  <div className="bg-[#7c3aed]/30 text-[#a78bfa] rounded-[20px] text-[9px] px-[10px] py-[3px] mb-4">
                    PAGE 1 OF 4
                  </div>
                  
                  <div className="w-full flex flex-col gap-2">
                    <div className="w-[100%] h-[7px] bg-[#2d2b4e] rounded-[3px]" />
                    <div className="w-[88%] h-[7px] bg-[#2d2b4e] rounded-[3px]" />
                    <div className="w-[95%] h-[7px] bg-[#2d2b4e] rounded-[3px]" />
                    
                    <div className="w-full bg-[#7c3aed]/12 border-l-2 border-[#7c3aed] rounded-r-[4px] p-[6px] px-[8px] my-1">
                      <div className="w-[90%] h-[7px] bg-[#a78bfa]/40 rounded-[4px]" />
                    </div>
                    
                    <div className="w-[70%] h-[7px] bg-[#2d2b4e] rounded-[3px]" />
                    <div className="w-[82%] h-[7px] bg-[#2d2b4e] rounded-[3px]" />
                  </div>

                  <div className="mt-[10px] w-full">
                    <div className="text-[#a78bfa] text-[9px] font-bold mb-2">✨ Summary</div>
                    <div className="flex flex-col gap-1.5">
                      <div className="w-[100%] h-[6px] bg-[#7c3aed]/15 rounded-[3px]" />
                      <div className="w-[75%] h-[6px] bg-[#7c3aed]/15 rounded-[3px]" />
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="w-[40%] bg-gradient-to-b from-[#1a1728] to-[#13111c] rounded-[12px] p-[14px] flex flex-col items-center gap-[10px]">
                  <div className="text-white/40 text-[8px] tracking-[2px]">AUDIO</div>
                  
                  <div className="bg-[#0d9488]/20 border border-[#0d9488]/30 text-[#0d9488] rounded-[20px] text-[8px] px-[8px] py-[2px]">
                    Hindi
                  </div>
                  
                  <div className="w-[40px] h-[40px] bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-full shadow-[0_0_0_5px_rgba(124,58,237,0.15),0_0_0_10px_rgba(124,58,237,0.08),0_6px_20px_rgba(124,58,237,0.5)] flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
                  </div>

                  <div className="flex gap-[2px] items-center h-[24px]">
                    {[8,18,12,24,10,20,14,16].map((h, i) => (
                      <div key={i} className="w-[2.5px] rounded-[2px] bg-gradient-to-t from-[#7c3aed] to-[#a78bfa]" 
                           style={{ height: `${h}px`, animation: `audioWave 1s ease-in-out infinite alternate`, animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>

                  <div className="w-full h-[2px] bg-white/10 rounded-[2px] mt-1 relative">
                    <div className="absolute top-0 left-0 h-full w-[65%] bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] rounded-[2px]" />
                  </div>
                  
                  <div className="text-white/25 text-[8px] w-full text-center">0:10 / 0:16</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="bg-[#0f0f1a] px-8 md:px-[80px] py-[100px]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[32px] md:text-[40px] font-extrabold text-white mb-4">
              Everything you need to<br/>digest content faster
            </h2>
            <p className="text-[#a78bfa] text-[16px] max-w-[600px] mx-auto">
              Stop reading hundreds of pages. Let our AI read, summarize, and speak to you while you multitask.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="bg-[#1e1b4b] border border-[#7c3aed]/25 rounded-[20px] p-8 hover:-translate-y-2 hover:border-[#7c3aed] hover:shadow-[0_20px_50px_rgba(124,58,237,0.25)] transition-all duration-300">
              <div className="w-12 h-12 bg-[#0d9488]/15 rounded-xl flex items-center justify-center mb-6">
                <Volume2 className="w-6 h-6 text-[#0d9488]" />
              </div>
              <h3 className="text-white text-[18px] font-bold mb-3">Multilingual TTS</h3>
              <p className="text-[#a1a1aa] leading-relaxed">
                Listen in 50+ languages including Hindi and regional Indian languages with natural human-like voices
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-[#1e1b4b] border border-[#7c3aed]/25 rounded-[20px] p-8 hover:-translate-y-2 hover:border-[#7c3aed] hover:shadow-[0_20px_50px_rgba(124,58,237,0.25)] transition-all duration-300">
              <div className="w-12 h-12 bg-[#7c3aed]/15 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-[#a78bfa]" />
              </div>
              <h3 className="text-white text-[18px] font-bold mb-3">AI Summarization</h3>
              <p className="text-[#a1a1aa] leading-relaxed">
                Get instant accurate page-wise summaries powered by Gemini AI — no reading required
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-[#1e1b4b] border border-[#7c3aed]/25 rounded-[20px] p-8 hover:-translate-y-2 hover:border-[#7c3aed] hover:shadow-[0_20px_50px_rgba(124,58,237,0.25)] transition-all duration-300">
              <div className="w-12 h-12 bg-[#60a5fa]/15 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-[#60a5fa]" />
              </div>
              <h3 className="text-white text-[18px] font-bold mb-3">Universal Formats</h3>
              <p className="text-[#a1a1aa] leading-relaxed">
                Seamlessly upload and process PDF, Word documents, and PowerPoint files without losing formatting
              </p>
            </div>
            
            {/* Card 4 */}
            <div className="bg-[#1e1b4b] border border-[#7c3aed]/25 rounded-[20px] p-8 hover:-translate-y-2 hover:border-[#7c3aed] hover:shadow-[0_20px_50px_rgba(124,58,237,0.25)] transition-all duration-300">
              <div className="w-12 h-12 bg-[#f472b6]/15 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-[#f472b6]" />
              </div>
              <h3 className="text-white text-[18px] font-bold mb-3">Ask AI Anything</h3>
              <p className="text-[#a1a1aa] leading-relaxed">
                Ask any question about your document content and get instant intelligent spoken answers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LANGUAGES SECTION */}
      <section id="languages" className="bg-[#13111C] px-8 md:px-[80px] py-[80px]">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[36px] font-bold text-white mb-4">Listen in your language</h2>
            <p className="text-[#a1a1aa] text-[15px]">DocVoice supports 50+ languages with natural AI voices</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              "🇮🇳 Hindi", "🇬🇧 English", "🇮🇳 Tamil", "🇮🇳 Telugu",
              "🇮🇳 Bengali", "🇮🇳 Marathi", "🇮🇳 Punjabi", "🇮🇳 Gujarati",
              "🇮🇳 Kannada", "🇮🇳 Malayalam", "🇪🇸 Spanish", "🇫🇷 French",
              "🇩🇪 German", "🇯🇵 Japanese", "🇸🇦 Arabic", "🇧🇷 Portuguese"
            ].map(lang => (
              <div key={lang} className="bg-[#1e1b4b] border border-[#7c3aed]/20 rounded-[12px] p-[12px] text-center hover:border-[#7c3aed] hover:bg-[#7c3aed]/10 transition-all duration-200 cursor-default">
                {lang}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <span className="text-[#a78bfa] text-[14px]">+ 34 more languages supported</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="bg-[#0f0f1a] px-8 md:px-[80px] py-[100px] text-center">
        <h2 className="text-[32px] md:text-[40px] font-bold text-white mb-16">How DocVoice works</h2>
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center md:items-start justify-between relative gap-12 md:gap-0">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-[2px] border-t-2 border-dotted border-[#7c3aed]/40 -z-10" />
          
          <div className="flex flex-col items-center max-w-[260px]">
            <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] shadow-[0_8px_24px_rgba(124,58,237,0.4)] flex items-center justify-center text-white text-[20px] font-bold mb-6">1</div>
            <Upload className="w-[32px] h-[32px] text-[#7c3aed] mb-4" />
            <h3 className="text-white text-[20px] font-bold mb-2">Upload your document</h3>
            <p className="text-[#a1a1aa] text-[14px]">PDF, DOCX, or PPTX — any format works</p>
          </div>
          
          <div className="flex flex-col items-center max-w-[260px]">
            <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] shadow-[0_8px_24px_rgba(124,58,237,0.4)] flex items-center justify-center text-white text-[20px] font-bold mb-6">2</div>
            <Globe2 className="w-[32px] h-[32px] text-[#7c3aed] mb-4" />
            <h3 className="text-white text-[20px] font-bold mb-2">Choose your language</h3>
            <p className="text-[#a1a1aa] text-[14px]">Select from 50+ languages including Hindi</p>
          </div>
          
          <div className="flex flex-col items-center max-w-[260px]">
            <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] shadow-[0_8px_24px_rgba(124,58,237,0.4)] flex items-center justify-center text-white text-[20px] font-bold mb-6">3</div>
            <Headphones className="w-[32px] h-[32px] text-[#7c3aed] mb-4" />
            <h3 className="text-white text-[20px] font-bold mb-2">Listen and learn</h3>
            <p className="text-[#a1a1aa] text-[14px]">AI reads and summarizes every page for you</p>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="bg-[#13111C] px-8 md:px-[80px] py-[100px]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-[60%]">
            <div className="inline-block px-3 py-1 bg-[#7c3aed]/15 text-[#a78bfa] rounded-full text-[13px] font-medium mb-6">
              Our Mission
            </div>
            <h2 className="text-[32px] md:text-[40px] font-bold text-white leading-tight mb-8">
              Built for students,<br/>professionals, and<br/>curious minds
            </h2>
            <p className="text-[#a1a1aa] text-[16px] leading-[1.8] mb-6">
              DocVoice was created to solve a simple problem — too much to read, too little time. We believe knowledge should be accessible to everyone, in every language, at any time.
            </p>
            <p className="text-[#a1a1aa] text-[16px] leading-[1.8]">
              Whether you are a student trying to understand a research paper, a professional reviewing reports on the go, or simply someone who learns better by listening — DocVoice is built for you.
            </p>
          </div>
          
          <div className="w-full md:w-[40%] flex flex-col gap-4">
            <div className="bg-[#1e1b4b] border border-[#7c3aed]/20 rounded-[16px] px-[32px] py-[24px] flex items-center gap-[16px]">
              <div className="text-[#7c3aed] text-[48px] font-bold">50+</div>
              <div className="text-[#a1a1aa] text-[14px]">Languages supported</div>
            </div>
            <div className="bg-[#1e1b4b] border border-[#7c3aed]/20 rounded-[16px] px-[32px] py-[24px] flex items-center gap-[16px]">
              <div className="text-[#7c3aed] text-[48px] font-bold">3</div>
              <div className="text-[#a1a1aa] text-[14px]">File formats accepted</div>
            </div>
            <div className="bg-[#1e1b4b] border border-[#7c3aed]/20 rounded-[16px] px-[32px] py-[24px] flex items-center gap-[16px]">
              <div className="text-[#7c3aed] text-[48px] font-bold">2x</div>
              <div className="text-[#a1a1aa] text-[14px]">Faster content consumption</div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="bg-[#0f0f1a] px-8 md:px-[80px] py-[80px]">
        <div className="max-w-[640px] mx-auto bg-[#1e1b4b] border border-[#7c3aed]/30 rounded-[24px] p-8 md:p-[48px] text-center">
          <h2 className="text-white text-[28px] font-bold mb-2">Have questions? Get in touch</h2>
          <p className="text-[#a1a1aa] text-[14px] mb-8">We typically respond within 24 hours</p>
          
          <div className="flex justify-center items-center gap-2 mb-4 text-white hover:text-[#a78bfa] transition-colors">
            <Mail className="w-5 h-5" />
            <a href="mailto:docvoice@gmail.com">docvoice@gmail.com</a>
          </div>
          <div className="flex justify-center items-center gap-2 mb-8 text-white hover:text-[#a78bfa] transition-colors">
            <Globe2 className="w-5 h-5" />
            <a href="https://github.com/docvoice" target="_blank" rel="noreferrer">github.com/docvoice</a>
          </div>
          
          <div className="w-full h-[1px] bg-white/5 mb-8" />
          
          <p className="text-[#a1a1aa] text-[14px] mb-4">Stay updated with new features</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 bg-[#0f0f23] border border-[#7c3aed]/30 rounded-xl px-5 py-3 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#7c3aed] transition-colors"
            />
            <button className="bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-xl px-7 py-3 text-white font-bold hover:-translate-y-0.5 transition-transform">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a0a14] border-t border-white/5 px-8 md:px-[80px] py-[32px] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          {/* Using a simple icon for the footer logo since DocVoiceLogo component might not be dark-theme ready without props */}
          <div className="w-6 h-6 rounded bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center">
            <Volume2 className="w-3 h-3 text-white" />
          </div>
          <span className="text-[#a1a1aa] text-[13px]">© 2025 DocVoice. All rights reserved.</span>
        </div>
        <div className="flex gap-6 text-[#a1a1aa] text-[13px]">
          <Link to="#features" className="hover:text-white transition-colors">Features</Link>
          <Link to="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
          <Link to="#" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
