"use client";
import React, { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Cpu, Activity } from "lucide-react";

interface ChatProps {
  logs: string[];
  llmResponse: string;
  isStreaming: boolean;
  onSubmit: (prompt: string) => void;
}

export default function ChatWindow({ logs, llmResponse, isStreaming, onSubmit }: ChatProps) {
  const [input, setInput] = useState<string>("");
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, llmResponse]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSubmit(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[70vh] bg-[#141414]/90 border border-[#FF6600]/30 rounded-xl shadow-[0_0_30px_rgba(255,102,0,0.05)] backdrop-blur-md overflow-hidden font-mono">
      
      {/* Stream Monitor */}
      <div className="h-1/3 border-b border-[#FF6600]/20 bg-black/40 p-4 overflow-y-auto text-xs text-emerald-400">
        <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#FF6600]/10 text-[#FF6600] uppercase tracking-widest text-[10px] font-bold">
          <Activity className="h-3 w-3 animate-pulse" /> Live Preprocessing Telemetry Trace
        </div>
        {logs && logs.map((log, i) => (
          <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} key={i} className="mb-1">
            {log}
          </motion.div>
        ))}
        {isStreaming && (!logs || logs.length === 0) && (
          <span className="animate-pulse text-gray-500">Waiting for local pipeline hook...</span>
        )}
      </div>

      {/* Main Output */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 text-sm">
        <div className="flex items-center gap-2 text-[#FF6600]/50 uppercase tracking-widest text-[10px] font-bold mb-1">
          <Cpu className="h-3 w-3" /> Agent Execution Response Node
        </div>
        <AnimatePresence mode="wait">
          {llmResponse && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="leading-relaxed text-gray-200 whitespace-pre-line">
              {llmResponse}
              {isStreaming && <span className="inline-block w-2 h-4 bg-[#FF6600] ml-1 animate-pulse" />}
            </motion.div>
          )}
          {!llmResponse && !isStreaming && (
            <p className="text-gray-600 italic">Submit system instruction payload to activate runtime loop...</p>
          )}
        </AnimatePresence>
        <div ref={logEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-black/60 border-t border-[#FF6600]/20 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ENTER SYSTEM DIRECTIVE [e.g., Run outlier pipeline]..."
          className="flex-1 bg-[#0A0A0A] border border-[#FF6600]/30 rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-[#FF6600] focus:shadow-[0_0_10px_rgba(255,102,0,0.2)] font-mono transition-all"
          disabled={isStreaming}
        />
        <button
          type="submit"
          disabled={isStreaming}
          className="bg-[#FF6600] hover:bg-[#CC5200] disabled:bg-gray-800 disabled:text-gray-600 text-black font-bold px-5 py-2 rounded transition-all flex items-center gap-2 text-sm"
        >
          <Send className="h-4 w-4" /> EXECUTE
        </button>
      </form>
    </div>
  );
}