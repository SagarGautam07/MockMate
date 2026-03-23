import { useEffect, useRef, useState, useCallback } from 'react';
import { VideoOff, Minimize2, Camera } from 'lucide-react';

export default function CameraPreview({ active, onError }) {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle');
  // 'idle' | 'loading' | 'live' | 'denied' | 'mini'

  const kill = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!active) { kill(); setStatus('idle'); return; }

    let gone = false;
    setStatus('loading');

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        if (gone) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus('live');
      })
      .catch(err => {
        if (gone) return;
        setStatus('denied');
        const m = { NotAllowedError: 'Camera permission denied.', NotFoundError: 'No camera found.', NotReadableError: 'Camera in use by another app.' };
        if (onError) onError(m[err.name] || 'Camera unavailable.');
      });

    return () => { gone = true; kill(); };
  }, [active, kill, onError]);

  if (!active || status === 'idle') return null;

  if (status === 'denied') return (
    <div className="fixed bottom-24 right-4 z-50 bg-slate-900/95 border border-white/10
                    rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-white/40
                    backdrop-blur-sm shadow-lg">
      <VideoOff className="w-3.5 h-3.5" />
      Camera unavailable
    </div>
  );

  if (status === 'mini') return (
    <button type="button" onClick={() => setStatus('live')}
            className="fixed bottom-24 right-4 z-50 w-10 h-10 rounded-full bg-slate-900
                       border border-cyan-500/40 flex items-center justify-center
                       hover:border-cyan-400 transition-colors shadow-lg">
      <Camera className="w-5 h-5 text-cyan-400" />
    </button>
  );

  return (
    <div className="fixed bottom-24 right-4 z-50 group">
      <div className="relative w-44 h-32 rounded-xl overflow-hidden border-2
                      border-cyan-500/40 bg-slate-950 shadow-lg shadow-black/40">
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
            <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <video ref={videoRef} autoPlay muted playsInline
               className="w-full h-full object-cover"
               style={{ transform: 'scaleX(-1)' }} />
        {status === 'live' && (
          <div className="absolute top-1.5 left-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white/60 text-xs font-mono">LIVE</span>
          </div>
        )}
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={() => setStatus('mini')}
                  className="w-6 h-6 rounded bg-black/70 hover:bg-black flex items-center justify-center transition-colors">
            <Minimize2 className="w-3 h-3 text-white" />
          </button>
          <button type="button" onClick={() => { kill(); setStatus('denied'); }}
                  className="w-6 h-6 rounded bg-black/70 hover:bg-red-600 flex items-center justify-center transition-colors text-white text-xs font-bold">
            ✕
          </button>
        </div>
      </div>
      <p className="text-center text-white/30 text-xs mt-1 font-mono">You</p>
    </div>
  );
}
