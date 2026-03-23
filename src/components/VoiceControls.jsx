// VoiceControls.jsx
// Mic button, recording indicator, live transcript display, and browser support warning

import { Mic, MicOff, Volume2 } from 'lucide-react';

/**
 * @param {{
 *   isListening: boolean,
 *   isSpeaking: boolean,
 *   transcript: string,
 *   sttSupported: boolean,
 *   ttsSupported: boolean,
 *   sttError: string | null,
 *   onStartListening: () => void,
 *   onStopListening: () => void,
 *   onStopSpeaking: () => void,
 * }} props
 */
export default function VoiceControls({
  isListening,
  isSpeaking,
  transcript,
  sttSupported,
  // eslint-disable-next-line no-unused-vars
  ttsSupported,
  sttError,
  onStartListening,
  onStopListening,
  onStopSpeaking,
}) {
  return (
    <div className="space-y-3">
      {/* TTS speaking indicator */}
      {isSpeaking && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg
                        bg-cyan-500/10 border border-cyan-500/30"
        >
          <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-cyan-300 text-sm">Reading question aloud...</span>
          <button
            type="button"
            onClick={onStopSpeaking}
            className="ml-auto text-white/50 hover:text-white/80 text-xs
                       underline transition-colors"
          >
            Stop
          </button>
        </div>
      )}

      {/* STT not supported warning */}
      {!sttSupported && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg
                        bg-amber-500/10 border border-amber-500/30 text-sm"
        >
          <MicOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-amber-300">
            Voice input requires Chrome or Edge browser.
          </span>
        </div>
      )}

      {/* STT error */}
      {sttError && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg
                        bg-red-500/10 border border-red-500/30 text-sm"
        >
          <MicOff className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300">{sttError}</span>
        </div>
      )}

      {/* Microphone button */}
      {sttSupported && (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={isListening ? onStopListening : onStartListening}
            className={`relative w-16 h-16 rounded-full font-semibold
              flex items-center justify-center
              transition-all duration-200 shadow-lg
              ${
                isListening
                  ? 'bg-red-500 hover:bg-red-400 shadow-red-500/40 scale-110'
                  : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-2 border-cyan-500/60 hover:border-cyan-400'
              }`}
            title={isListening ? 'Stop recording' : 'Start voice answer'}
          >
            {/* Pulsing ring animation when recording */}
            {isListening && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                <span
                  className="absolute inset-[-4px] rounded-full border-2
                                 border-red-500/40 animate-pulse"
                />
              </>
            )}
            {isListening ? (
              <MicOff className="w-6 h-6 text-white relative z-10" />
            ) : (
              <Mic className="w-6 h-6 text-cyan-400 relative z-10" />
            )}
          </button>

          <p className="text-white/50 text-xs text-center">
            {isListening ? (
              <span className="text-red-400 font-medium">● Recording — click to stop</span>
            ) : (
              'Click to answer by voice'
            )}
          </p>
        </div>
      )}

      {/* Live transcript display */}
      {isListening && transcript && (
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-white/40 text-xs mb-1 uppercase tracking-wide font-mono">
            Live transcript
          </p>
          <p className="text-white text-sm leading-relaxed">{transcript}</p>
        </div>
      )}
    </div>
  );
}

