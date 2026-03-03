import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Video, 
  Sparkles, 
  Play, 
  Pause, 
  Volume2, 
  Share2, 
  Copy, 
  Check,
  Zap,
  Disc,
  ExternalLink
} from 'lucide-react';
import ReactPlayer from 'react-player';

// Constants
const YOUTUBE_URL = "https://www.youtube.com/watch?v=nVieg5zyP1Y";

interface DJPrompt {
  id: string;
  title: string;
  mood: string;
  prompt: string;
  malayDesc: string;
  tags: string[];
  color: string;
}

const DJ_PROMPTS: DJPrompt[] = [
  {
    id: 'original',
    title: 'Classic Sai Yo',
    mood: 'High Energy',
    prompt: "Modern Thai Disco (Sai Yo), high-energy, 145 BPM, heavy sub-bass drops, aggressive rap verses in Thai, catchy synth hooks, traditional Thai instruments (Phin, Khaen) mixed with electronic dance music, club atmosphere, super heavy bass, trending TikTok style, high fidelity, studio quality.",
    malayDesc: "Lagu Disco Thai moden (Sai Yo), tenaga tinggi, 145 BPM, dentuman bass berat, rap agresif dalam bahasa Thai, melodi synth yang catchy, gabungan alat muzik tradisional Thai (Phin, Khaen) dengan EDM, suasana kelab, bass super heavy, gaya trending TikTok.",
    tags: ['Heavy Bass', 'Thai Rap', 'Sai Yo', '145 BPM'],
    color: 'emerald'
  },
  {
    id: 'phonk',
    title: 'Thai Phonk Remix',
    mood: 'Aggressive / Dark',
    prompt: "Aggressive Thai Phonk, 130 BPM, distorted cowbell melodies, heavy Memphis-style bass, Thai street rap, dark atmosphere, underground racing vibe, high-energy percussion, lo-fi aesthetic mixed with high-fidelity sub-bass, trending phonk style.",
    malayDesc: "Gaya Phonk Thai yang agresif, 130 BPM, melodi cowbell yang herot, bass berat gaya Memphis, rap jalanan Thai, suasana gelap, vibe lumba haram bawah tanah, perkusi bertenaga tinggi, estetik lo-fi dengan sub-bass padu.",
    tags: ['Phonk', 'Dark', 'Cowbell', 'Street Rap'],
    color: 'purple'
  },
  {
    id: 'reggaeton',
    title: 'Thai-Tropic Dembow',
    mood: 'Summer / Dance',
    prompt: "Thai Disco mixed with Reggaeton Dembow rhythm, 100 BPM, tropical synth leads, smooth Thai melodic vocals, beach club atmosphere, heavy but bouncy bassline, percussion-heavy, summer festival vibes, catchy reggaeton beat with Thai instruments.",
    malayDesc: "Disco Thai bercampur ritma Reggaeton Dembow, 100 BPM, melodi synth tropikal, vokal melodi Thai yang lancar, suasana kelab pantai, bassline yang melantun, perkusi padat, vibe festival musim panas.",
    tags: ['Reggaeton', 'Tropical', 'Dembow', 'Summer'],
    color: 'orange'
  },
  {
    id: 'hardstyle',
    title: 'Thai Festival Hardstyle',
    mood: 'Euphoric / Hard',
    prompt: "Euphoric Thai Hardstyle, 150 BPM, hard-hitting distorted kicks, massive supersaw leads, traditional Thai Phin solo breakdown, high-energy festival atmosphere, aggressive Thai shouting vocals, epic build-ups, super heavy bass drops.",
    malayDesc: "Hardstyle Thai yang euforik, 150 BPM, kick yang herot dan padu, melodi supersaw besar, breakdown solo Phin tradisional, suasana festival bertenaga tinggi, vokal jeritan Thai yang agresif, build-up epik.",
    tags: ['Hardstyle', 'Festival', 'Aggressive', '150 BPM'],
    color: 'red'
  },
  {
    id: 'lofi',
    title: 'Nostalgic Thai Chill',
    mood: 'Relaxed / Retro',
    prompt: "Lo-fi Thai Disco remix, 85 BPM, nostalgic 80s Thai pop samples, smooth jazzy bassline, vinyl crackle, relaxed atmosphere, chill-hop beats, dreamy synth pads, retro Thai aesthetic, late-night driving vibe, high fidelity lo-fi.",
    malayDesc: "Remix Lo-fi Disco Thai, 85 BPM, sampel pop Thai 80-an yang nostalgia, bassline jazzy yang lancar, bunyi crackle piring hitam, suasana santai, beat chill-hop, pad synth bermimpi, estetik Thai retro.",
    tags: ['Lo-fi', 'Chill', 'Retro', 'Nostalgic'],
    color: 'blue'
  }
];

export default function App() {
  const [activePrompt, setActivePrompt] = useState<DJPrompt>(DJ_PROMPTS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(activePrompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const generateDJAnimation = async () => {
    if (!hasApiKey) {
      handleOpenKeySelector();
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Super realistic DJ in a high-tech neon underground club, mood: ${activePrompt.mood}, wearing futuristic headphones, remixing on a glowing digital console with intense laser lights, cinematic 4k, heavy bass visual vibrations, smoke and strobe effects, hyper-detailed, energetic atmosphere.`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY || '',
          },
        });
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error("Video generation failed:", error);
      alert("Gagal menjana video. Sila pastikan API Key anda sah dan mempunyai kredit.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Zap className="w-3 h-3 fill-current" />
            Trending Thai Disco Remix
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent"
          >
            Thai Disco DJ <br /> <span className="text-emerald-400">Remix Visualizer</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            Cipta prompt lagu disco Thai yang padu dan jana animasi DJ super realistic untuk remix anda.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Prompt & Controls */}
          <div className="space-y-8">
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Music className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl">DJ Prompts</h2>
                    <p className="text-white/40 text-xs">Pilih gaya remix kegemaran anda</p>
                  </div>
                </div>
                <button 
                  onClick={handleCopyPrompt}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors relative group"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-white/60" />}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Copy Active
                  </span>
                </button>
              </div>

              {/* Prompt Selector */}
              <div className="flex flex-wrap gap-2 mb-8">
                {DJ_PROMPTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePrompt(p)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      activePrompt.id === p.id 
                        ? 'bg-emerald-500 border-emerald-400 text-black' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activePrompt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-sm leading-relaxed text-emerald-100/80">
                    <div className="mb-2 text-white/40 text-[10px] uppercase tracking-widest flex items-center justify-between">
                      <span>English Prompt:</span>
                      <span className="text-emerald-500/60 font-sans">{activePrompt.mood}</span>
                    </div>
                    {activePrompt.prompt}
                    <div className="mt-4 mb-2 text-white/40 text-[10px] uppercase tracking-widest">Deskripsi (Malay):</div>
                    <div className="text-white/60 italic font-sans">{activePrompt.malayDesc}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activePrompt.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/40">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Video className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl">DJ Animation</h2>
                  <p className="text-white/40 text-xs">Jana visual DJ realistic (Veo)</p>
                </div>
              </div>

              <button
                onClick={generateDJAnimation}
                disabled={isGenerating}
                className={`w-full py-4 rounded-xl font-display font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                  isGenerating 
                    ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 active:scale-[0.98]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Menjana Visual...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Jana Animasi DJ Gempak
                  </>
                )}
              </button>

              {!hasApiKey && (
                <p className="mt-4 text-center text-xs text-white/30">
                  * Memerlukan API Key berbayar untuk akses model Veo.
                </p>
              )}
            </motion.section>
          </div>

          {/* Right Column: Visuals */}
          <div className="space-y-8">
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card overflow-hidden aspect-video relative group"
            >
              {videoUrl ? (
                <video 
                  src={videoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-black/40 flex flex-col items-center justify-center p-12 text-center">
                  <div className={`w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 ${isGenerating ? 'animate-pulse' : ''}`}>
                    <Video className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">Visual DJ Preview</h3>
                  <p className="text-white/40 text-sm">Klik butang "Jana Animasi" untuk melihat visual DJ super realistic.</p>
                </div>
              )}
              
              {isGenerating && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                  <h4 className="font-display font-bold text-xl mb-2">Mencipta Keajaiban...</h4>
                  <p className="text-white/60 text-sm max-w-xs">Proses ini mengambil masa sekitar 1-2 minit. Sila tunggu sebentar.</p>
                </div>
              )}
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <Disc className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl">Source Track</h2>
                    <p className="text-white/40 text-xs">Thai Disco Reference</p>
                  </div>
                </div>
                <a 
                  href={YOUTUBE_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>

              <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/5">
                <ReactPlayer 
                  url={YOUTUBE_URL}
                  width="100%"
                  height="100%"
                  controls
                  light={true}
                  playIcon={
                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/40 hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-black fill-current ml-1" />
                    </div>
                  }
                />
              </div>
            </motion.section>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-white/5 text-center">
          <div className="flex items-center justify-center gap-6 mb-6">
            <a href="#" className="text-white/40 hover:text-emerald-400 transition-colors">Instagram</a>
            <a href="#" className="text-white/40 hover:text-emerald-400 transition-colors">TikTok</a>
            <a href="#" className="text-white/40 hover:text-emerald-400 transition-colors">YouTube</a>
          </div>
          <p className="text-white/20 text-xs font-mono">
            &copy; 2026 THAI DISCO DJ REMIX VISUALIZER. POWERED BY GEMINI VEO 3.1.
          </p>
        </footer>
      </main>

      {/* Floating Action for Key */}
      {!hasApiKey && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <button 
            onClick={handleOpenKeySelector}
            className="px-6 py-3 rounded-full bg-white text-black font-bold text-sm shadow-2xl flex items-center gap-2 hover:bg-emerald-400 transition-colors"
          >
            <Zap className="w-4 h-4 fill-current" />
            Sila Pilih API Key untuk Jana Video
          </button>
        </motion.div>
      )}
    </div>
  );
}
