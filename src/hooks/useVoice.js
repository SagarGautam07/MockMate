// useVoice.js
// Custom hook managing both Text-to-Speech and Speech-to-Text for interview mode
// Uses browser-native APIs only — no external libraries or API keys required

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * @returns {{
 *   speak: (text: string) => void,
 *   stopSpeaking: () => void,
 *   isSpeaking: boolean,
 *   startListening: () => void,
 *   stopListening: () => void,
 *   isListening: boolean,
 *   transcript: string,
 *   resetTranscript: () => void,
 *   sttSupported: boolean,
 *   ttsSupported: boolean,
 *   sttError: string | null,
 * }}
 */
export function useVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sttError, setSttError] = useState(null);

  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  // Feature detection
  const ttsSupported =
    typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined';
  const SpeechRecognitionAPI =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  const sttSupported = !!SpeechRecognitionAPI;

  // ── TEXT-TO-SPEECH ──────────────────────────────────────────

  const speak = useCallback(
    (text) => {
      if (!ttsSupported || !text) return;

      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Prefer an Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find((v) => v.lang === 'en-IN') ||
        voices.find((v) => v.lang?.startsWith('en') && v.name?.includes('Female')) ||
        voices.find((v) => v.lang?.startsWith('en')) ||
        null;

      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.lang = 'en-IN';
      utterance.rate = 0.88; // slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [ttsSupported],
  );

  const stopSpeaking = useCallback(() => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [ttsSupported]);

  // Voices load asynchronously in some browsers — reload on voiceschanged
  useEffect(() => {
    if (!ttsSupported) return;
    window.speechSynthesis.onvoiceschanged = () => {
      // Voices are now available — speak() reads them fresh
    };
  }, [ttsSupported]);

  // ── SPEECH-TO-TEXT ───────────────────────────────────────────

  const startListening = useCallback(() => {
    if (!sttSupported) {
      setSttError('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    setSttError(null);
    setTranscript('');

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true; // keep recording until stopListening()
      recognition.interimResults = true; // show partial results as user speaks
      recognition.lang = 'en-IN';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event) => {
        // Combine all result segments into one transcript string
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i += 1) {
          fullTranscript += event.results[i][0].transcript;
        }
        setTranscript(fullTranscript);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        const errorMessages = {
          'not-allowed':
            'Microphone access denied. Please allow microphone access in your browser settings.',
          'audio-capture':
            'No microphone found. Please connect a microphone and try again.',
          network: 'Network error during voice recognition. Please check your connection.',
          'no-speech': 'No speech detected. Please speak clearly and try again.',
          aborted: null, // user stopped manually — no message needed
          'service-not-allowed':
            'Voice recognition service is not available. Try using Chrome.',
        };
        const msg = errorMessages[event.error];
        if (msg) setSttError(msg);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      setSttError(`Could not start voice recognition: ${err.message}`);
    }
  }, [sttSupported, SpeechRecognitionAPI]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setSttError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [stopSpeaking, stopListening]);

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    startListening,
    stopListening,
    isListening,
    transcript,
    resetTranscript,
    sttSupported,
    ttsSupported,
    sttError,
  };
}

