"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

type VoiceLang = "en" | "bn";

const LANG_CONFIG: Record<VoiceLang, { code: string; label: string }> = {
  en: { code: "en-US", label: "EN" },
  bn: { code: "bn-BD", label: "বাং" },
};

export default function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState("");
  const [lang, setLang] = useState<VoiceLang>("en");
  const recognitionRef = useRef<any>(null);
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      setIsSupported(!!SR);
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const showError = useCallback((msg: string) => {
    setError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(null), 4000);
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    setInterimText("");

    // Stop any existing session first
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      showError("Speech recognition is not supported. Please use Chrome or Edge.");
      return;
    }

    try {
      const recognition = new SR();
      recognitionRef.current = recognition;

      recognition.lang = LANG_CONFIG[lang].code;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimText("");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final_ = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final_ += transcript;
          } else {
            interim += transcript;
          }
        }

        if (final_) {
          onTranscript(final_);
          setInterimText("");
        } else {
          setInterimText(interim);
        }
      };

      recognition.onerror = (event: any) => {
        // Don't show error for expected cases
        if (event.error === "aborted") {
          // User clicked stop — no error needed
          return;
        }
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          showError("🎤 Microphone blocked. Please allow microphone access in your browser settings.");
        } else if (event.error === "no-speech") {
          showError("🔇 No speech detected. Tap mic and speak clearly.");
        } else if (event.error === "network") {
          showError("🌐 Network error. Speech recognition requires internet.");
        } else if (event.error === "audio-capture") {
          showError("🎤 No microphone found. Please connect a microphone.");
        } else {
          showError(`Voice error: ${event.error}. Try again.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText("");
        recognitionRef.current = null;
      };

      recognition.start();
    } catch (err: any) {
      showError("Could not start voice input. Try refreshing the page.");
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [lang, onTranscript, showError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setInterimText("");
  }, []);

  const toggleLang = useCallback(() => {
    const wasListening = isListening;
    if (wasListening) stopListening();
    setLang((prev) => (prev === "en" ? "bn" : "en"));
  }, [isListening, stopListening]);

  // Don't render anything on server or if not supported
  if (!isSupported) return null;

  return (
    <div className="relative flex items-center gap-1.5">
      {/* Language Toggle */}
      <button
        type="button"
        onClick={toggleLang}
        disabled={disabled}
        aria-label={`Switch voice language to ${lang === "en" ? "Bangla" : "English"}`}
        title={`Voice: ${lang === "en" ? "English" : "বাংলা"} — Click to switch`}
        className={`
          flex items-center justify-center h-8 px-2 rounded-lg text-[11px] font-bold
          transition-all duration-200 select-none
          focus:outline-none focus:ring-2 focus:ring-brand-500/30
          ${
            lang === "bn"
              ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800"
              : "bg-gray-100 dark:bg-dark-hover text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-dark-border"
          }
          ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
        `}
      >
        {LANG_CONFIG[lang].label}
      </button>

      {/* Mic Button */}
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
        className={`
          relative flex items-center justify-center w-10 h-10 rounded-xl
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40
          ${
            isListening
              ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
              : "bg-gray-100 dark:bg-dark-hover text-gray-500 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-600 dark:hover:text-brand-400"
          }
          ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {isListening ? (
          <MicOff className="w-[18px] h-[18px] relative z-10" />
        ) : (
          <Mic className="w-[18px] h-[18px]" />
        )}

        {/* Pulse animation rings */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.span
                key="pulse1"
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-xl bg-red-500 pointer-events-none"
              />
              <motion.span
                key="pulse2"
                initial={{ scale: 1, opacity: 0.25 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                className="absolute inset-0 rounded-xl bg-red-500 pointer-events-none"
              />
            </>
          )}
        </AnimatePresence>
      </button>

      {/* Interim Text Preview */}
      <AnimatePresence>
        {interimText && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            className="absolute bottom-full mb-3 right-0 max-w-[260px] px-3 py-2 rounded-xl
              bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800
              text-brand-700 dark:text-brand-300 text-xs font-medium shadow-lg z-50
              truncate"
          >
            🎙️ {interimText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute bottom-full mb-3 right-0 w-72 px-4 py-3 rounded-xl
              bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800
              text-red-700 dark:text-red-300 text-xs font-medium shadow-lg z-50
              leading-relaxed"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
