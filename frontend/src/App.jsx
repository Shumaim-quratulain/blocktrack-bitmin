import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Scan, Box, Lock, AlertTriangle, CheckCircle, Terminal, Key, Fingerprint, ChevronRight, X, Zap, Globe, Activity } from 'lucide-react';

// ⚠️ IMPORTANT: Use this URL for local testing
const API_URL = 'http://localhost:5000/api';

// --- NATIVE CAMERA COMPONENT (Full Screen) ---
const FullScreenCamera = () => {
  const videoRef = useRef(null);
  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) { console.error("Camera error", e); }
    };
    start();
  }, []);
  
  return (
    <div className="absolute inset-0 z-0">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(transparent_2px,#000_3px)] bg-[size:100%_4px] opacity-20 pointer-events-none"></div>
    </div>
  );
};

function App() {
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(false);
  const [scanInput, setScanInput] = useState('');     
  const [secretInput, setSecretInput] = useState(''); 
  const [assetData, setAssetData] = useState(null);   
  const [mintedKeys, setMintedKeys] = useState(null); 

  // --- ACTIONS ---
  const handleMint = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/mint`);
      setMintedKeys(res.data); 
    } catch (e) { alert("Connection Error: Is Backend Running?"); }
    setLoading(false);
  };

  const handlePublicScan = async (id) => {
    if(!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/scan/${id}`);
      setAssetData({ ...res.data, publicId: id });
      setView('result');
    } catch (e) { alert("❌ ID NOT FOUND ON LEDGER"); }
    setLoading(false);
  };

  const handleSecureClaim = async () => {
    if(!secretInput) return alert("Please enter the Scratch-Off Code");
    try {
      const res = await axios.post(`${API_URL}/claim`, {
        publicId: assetData.publicId,
        privateKeyInput: secretInput
      });
      const refreshRes = await axios.get(`${API_URL}/scan/${assetData.publicId}`);
      setAssetData({ ...refreshRes.data, publicId: assetData.publicId });
      alert("✅ " + res.data.message);
      setSecretInput(''); 
    } catch (e) { alert("⛔ ACCESS DENIED: " + (e.response?.data?.error || "Invalid Key")); }
  };

  // --- VIEW: LANDING PAGE (Modern SaaS Hero) ---
  if (view === 'home') return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-cyan-500/30">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">BlockTrack</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium">
          <span className="hover:text-white cursor-pointer transition">Protocol</span>
          <span className="hover:text-white cursor-pointer transition">Network</span>
          <span className="hover:text-white cursor-pointer transition">Docs</span>
        </div>
        <button className="hidden md:block px-4 py-2 text-xs font-bold border border-gray-700 rounded-full hover:border-gray-500 transition">
          CONNECT WALLET
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-20 pb-32 px-6 max-w-7xl mx-auto text-center md:text-left">
        
        {/* Background Glow Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -z-10"></div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Content */}
          <div className="space-y-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900/50 border border-gray-800 text-xs font-mono text-cyan-400 animate-float">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              PROTOCOL V2.0 LIVE
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight">
              Secure the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                Physical World.
              </span>
            </h1>

            <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
              The first decentralized ledger for anti-counterfeit supply chains. 
              Verify authenticity, track history, and secure ownership with cryptographic proofs.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => setView('scan')}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/25 hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <Scan size={20} /> CONSUMER SCAN
              </button>
              <button 
                onClick={() => setView('admin')}
                className="px-8 py-4 bg-gray-900 border border-gray-700 rounded-xl font-bold text-gray-300 hover:bg-gray-800 hover:text-white transition flex items-center justify-center gap-2 group"
              >
                <Box size={20} /> MANUFACTURER LOGIN
              </button>
            </div>

            {/* Stats */}
            <div className="pt-8 flex items-center gap-8 text-gray-500 text-sm font-mono border-t border-gray-800 mt-8">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-gray-600"/> Global Ledger
              </div>
              <div className="flex items-center gap-2">
                {/* FIX: Changed <0.1s to &lt;0.1s to prevent JSX error */}
                <Zap size={16} className="text-gray-600"/> &lt;0.1s Latency
              </div>
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-gray-600"/> AES-256
              </div>
            </div>
          </div>

          {/* Right: Visual/Graphic */}
          <div className="relative hidden md:block">
            <div className="relative z-10 bg-gray-900/80 backdrop-blur-xl border border-gray-700 p-6 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition duration-500">
              {/* Fake Code Interface */}
              <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-auto text-xs text-gray-500 font-mono">status: active</div>
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Hash</span>
                  <span className="text-cyan-400">0x7f...3a2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Block</span>
                  <span className="text-purple-400">#19,204,991</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-400">VERIFIED</span>
                </div>
                <div className="h-32 bg-gray-800/50 rounded mt-4 flex items-center justify-center text-gray-600">
                  <Activity size={32} className="animate-pulse"/>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur-2xl opacity-20"></div>
            <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-purple-500 rounded-full blur-xl opacity-20"></div>
          </div>

        </div>
      </main>
    </div>
  );

  // 2. MANUFACTURER VIEW (Terminal Style)
  if (view === 'admin') return (
    <div className="min-h-screen bg-black p-6 flex flex-col font-mono relative">
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[size:20px_20px]"></div>
      <button onClick={() => setView('home')} className="text-gray-500 hover:text-white mb-8 text-xs uppercase tracking-widest flex items-center gap-2 z-10 w-fit"><X size={16}/> Terminate Session</button>
      <div className="border border-dashed border-gray-700 p-6 flex-1 flex flex-col justify-center z-10 bg-black/80 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-white"><Terminal size={24}/> MINTING STATION</h2>
          <button onClick={handleMint} disabled={loading} className="w-full bg-white text-black p-4 font-bold text-xl hover:bg-gray-300 transition mb-8 border-2 border-gray-500">{loading ? "HASHING..." : "MINT NEW ASSET"}</button>
          {mintedKeys && (
            <div className="space-y-4 animate-bounce-in">
                <div className="bg-gray-900 border-l-4 border-blue-500 p-4">
                    <p className="text-[10px] text-blue-400 uppercase font-bold mb-1">PUBLIC ID (QR CODE)</p>
                    <p className="text-2xl font-black text-white tracking-widest">{mintedKeys.publicId}</p>
                </div>
                <div className="bg-gray-900 border-l-4 border-red-500 p-4">
                    <div className="flex items-center gap-2 mb-1"><Key size={12} className="text-red-500"/><p className="text-[10px] text-red-500 uppercase font-bold">PRIVATE KEY (SECRET)</p></div>
                    <p className="text-2xl font-black text-white tracking-widest">{mintedKeys.privateKey}</p>
                </div>
            </div>
          )}
      </div>
    </div>
  );

  // 3. SCANNER VIEW
  if (view === 'scan') return (
    <div className="h-screen w-screen bg-black relative overflow-hidden flex flex-col font-mono">
      <FullScreenCamera />
      <div className="relative z-20 p-6"><button onClick={() => setView('home')} className="bg-black/50 backdrop-blur text-white px-4 py-2 rounded-full border border-white/20 text-xs font-bold">← ABORT</button></div>
      <div className="mt-auto relative z-20 p-6 bg-gradient-to-t from-black via-black/90 to-transparent pt-20">
        <p className="text-white/60 text-xs mb-3 font-bold uppercase tracking-widest text-center">Scan Outer QR Code</p>
        <div className="flex border border-white/30 bg-black/50 backdrop-blur-md rounded-lg overflow-hidden p-1">
          <input value={scanInput} onChange={e => setScanInput(e.target.value)} placeholder="ENTER ID..." className="flex-1 bg-transparent p-3 text-lg font-bold text-white outline-none placeholder:text-gray-600 uppercase font-mono" />
          <button onClick={() => handlePublicScan(scanInput)} className="px-6 bg-white text-black font-bold">SCAN</button>
        </div>
      </div>
    </div>
  );

  // 4. RESULT VIEW
  if (view === 'result' && assetData) {
    const isSold = assetData.isConsumed;
    return (
      <div className="min-h-screen bg-black p-6 pb-40 font-mono relative overflow-x-hidden">
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        <button onClick={() => setView('home')} className="relative z-10 text-gray-500 mb-8 text-xs uppercase tracking-widest">← Back</button>
        <div className={`relative z-10 p-6 border-2 mb-8 text-center bg-black ${isSold ? 'border-red-600' : 'border-green-500'}`}>
            <div className={`absolute top-0 left-0 w-2 h-2 ${isSold ? 'bg-red-600' : 'bg-green-500'}`}></div>
            <div className={`absolute top-0 right-0 w-2 h-2 ${isSold ? 'bg-red-600' : 'bg-green-500'}`}></div>
            <div className={`absolute bottom-0 left-0 w-2 h-2 ${isSold ? 'bg-red-600' : 'bg-green-500'}`}></div>
            <div className={`absolute bottom-0 right-0 w-2 h-2 ${isSold ? 'bg-red-600' : 'bg-green-500'}`}></div>
            {isSold ? <AlertTriangle size={40} className="mx-auto mb-2 text-red-600"/> : <CheckCircle size={40} className="mx-auto mb-2 text-green-500"/>}
            <h1 className={`text-2xl font-black mb-1 ${isSold ? 'text-red-600' : 'text-white'}`}>{isSold ? "ALREADY CONSUMED" : "ORIGIN VERIFIED"}</h1>
            <p className="text-[10px] uppercase text-gray-400">{isSold ? "WARNING: ID LOCKED & BURNED" : "SAFE TO PURCHASE"}</p>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-4 mb-10 border-b border-gray-800 pb-6">
            <div><p className="text-[10px] text-gray-600 mb-1">ASSET</p><p className="text-white text-sm font-bold">{assetData.name}</p></div>
            <div className="text-right"><p className="text-[10px] text-gray-600 mb-1">BATCH</p><p className="text-white text-sm font-mono">{assetData.batch}</p></div>
        </div>
        <h3 className="relative z-10 text-xs font-bold text-white uppercase tracking-[0.2em] mb-6 pl-2 border-l-4 border-white">Ledger History</h3>
        <div className="relative z-10 space-y-0 mb-10"> 
            {assetData.history.map((item, i) => (
                <div key={i} className="relative pl-8 pb-10 last:pb-0 group">
                    {i !== assetData.history.length - 1 && <div className="absolute left-[11px] top-4 bottom-0 w-px bg-gray-800 group-hover:bg-gray-600 transition-colors"></div>}
                    <div className={`absolute left-0 top-1 w-6 h-6 border-2 flex items-center justify-center bg-black z-20 ${item.status.includes('LOCKED') ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.6)]' : 'border-gray-700'}`}>
                        <div className={`w-1.5 h-1.5 ${item.status.includes('LOCKED') ? 'bg-white' : 'bg-gray-700'}`}></div>
                    </div>
                    <div className={`border bg-gray-900/40 p-4 relative transition-all duration-300 ${item.status.includes('LOCKED') ? 'border-white/50 bg-white/5' : 'border-gray-800 hover:border-gray-600'}`}>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/10"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/10"></div>
                        <div className="flex justify-between items-start mb-2">
                            <p className={`font-bold text-sm uppercase tracking-wider ${item.status.includes('LOCKED') ? 'text-white' : 'text-gray-300'}`}>{item.step}</p>
                            <span className="text-[10px] font-mono text-gray-500 bg-black px-1 border border-gray-800">{item.time || "--:--"}</span> 
                        </div>
                        <p className="text-xs text-gray-500 mb-3 flex items-center gap-2"><span className="w-1 h-1 bg-gray-600 rounded-full"></span>{item.location}</p>
                        <div className="flex items-center justify-between border-t border-gray-800 pt-3 mt-1">
                            <p className="text-[9px] text-gray-700 font-mono truncate max-w-[120px]">TX: {item.txHash ? item.txHash.substring(0, 16) : '0x...'}...</p>
                            <span className={`text-[9px] px-2 py-0.5 uppercase tracking-wide border ${item.status.includes('LOCKED') ? 'border-white text-white bg-white/10' : 'border-gray-800 text-gray-600'}`}>{item.status || 'CONFIRMED'}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        {!isSold && (
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gray-900 border-t border-gray-700 z-30">
                <p className="text-[10px] text-gray-400 mb-3 uppercase font-bold tracking-wider flex items-center gap-2"><Fingerprint size={12} /> Ownership Transfer Protocol</p>
                <div className="flex gap-2">
                    <input value={secretInput} onChange={e => setSecretInput(e.target.value)} placeholder="ENTER SCRATCH-OFF CODE" className="flex-1 bg-black border border-gray-600 p-3 text-sm font-mono text-white outline-none placeholder:text-gray-700 uppercase"/>
                    <button onClick={handleSecureClaim} className="bg-white text-black font-bold px-4 text-xs hover:bg-gray-200">CLAIM</button>
                </div>
                <p className="text-[9px] text-gray-600 mt-2 text-center">Requires valid private key hidden on product packaging.</p>
            </div>
        )}
      </div>
    );
  }
  return null;
}

export default App;