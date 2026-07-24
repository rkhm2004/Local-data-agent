"use client";
import React, { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Cpu, Activity, Database, Zap } from "lucide-react";
import { AgentState } from "@/app/page";

interface ChatProps {
  logs: string[];
  llmResponse: string;
  isStreaming: boolean;
  agentState: AgentState;
  onSubmit: (prompt: string) => void;
}

export default function ChatWindow({ logs, llmResponse, isStreaming, agentState, onSubmit }: ChatProps) {
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

  // Dynamic Status for the Right Panel
  const getStatusVisuals = () => {
    switch (agentState) {
      case "searching": return { color: "text-cyan-400", border: "border-cyan-500/50", glow: "shadow-[0_0_30px_rgba(0,255,255,0.15)]", corner: "border-cyan-500", icon: <Database className="h-4 w-4 animate-pulse" /> };
      case "executing": return { color: "text-red-500", border: "border-red-500/50", glow: "shadow-[0_0_40px_rgba(255,0,51,0.2)]", corner: "border-red-500", icon: <Zap className="h-4 w-4 animate-bounce" /> };
      case "streaming": return { color: "text-emerald-400", border: "border-emerald-500/50", glow: "shadow-[0_0_30px_rgba(0,255,102,0.15)]", corner: "border-emerald-500", icon: <Cpu className="h-4 w-4 animate-pulse" /> };
      default: return { color: "text-[#FF6600]", border: "border-[#FF6600]/30", glow: "shadow-[0_0_30px_rgba(255,102,0,0.05)]", corner: "border-[#FF6600]", icon: <Cpu className="h-4 w-4" /> };
    }
  };

  const visuals = getStatusVisuals();

  return (
    <div className="flex flex-col md:flex-row w-full h-full gap-6 font-mono">
      
      {/* ========================================== */}
      {/* LEFT PANEL: TELEMETRY (Light Blue Accents) */}
      {/* ========================================== */}
      <div className="hidden md:flex flex-col w-1/3 bg-[#050505]/80 border border-[#00D4FF]/30 rounded shadow-[0_0_20px_rgba(0,212,255,0.1)] backdrop-blur-md relative overflow-hidden">
        {/* Sci-Fi Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00D4FF]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00D4FF]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00D4FF]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00D4FF]" />

        <div className="p-4 border-b border-[#00D4FF]/20 bg-gradient-to-r from-[#00D4FF]/10 to-transparent">
          <div className="flex items-center gap-2 text-[#00D4FF] uppercase tracking-[0.2em] text-[11px] font-bold">
            <Activity className="h-4 w-4 animate-pulse" /> 
            SYS.TELEMETRY
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto text-[11px] text-[#00D4FF]/80 space-y-3">
          {logs && logs.map((log, i) => (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="pl-2 border-l border-[#00D4FF]/30">
              {log}
            </motion.div>
          ))}
          {isStreaming && (!logs || logs.length === 0) && (
            <span className="animate-pulse opacity-50 block mt-2">AWAITING HOOK...</span>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT PANEL: MAIN AI RESPONSE NODE         */}
      {/* ========================================== */}
      <div className={`flex flex-col flex-1 bg-[#050505]/80 border ${visuals.border} rounded ${visuals.glow} backdrop-blur-md relative overflow-hidden transition-all duration-700`}>
        {/* Dynamic Sci-Fi Corner Accents */}
        <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${visuals.corner} transition-colors duration-700`} />
        <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${visuals.corner} transition-colors duration-700`} />
        <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${visuals.corner} transition-colors duration-700`} />
        <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${visuals.corner} transition-colors duration-700`} />

        <div className="p-4 border-b border-white/5 bg-black/40">
          <div className={`flex items-center gap-2 ${visuals.color} uppercase tracking-[0.15em] text-[11px] font-bold transition-colors duration-500`}>
            {visuals.icon} 
            <span>OPERATIONAL_NODE {agentState !== "idle" && `[${agentState.toUpperCase()}]`}</span>
          </div>
        </div>

        {/* Output Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-sm bg-gradient-to-b from-transparent to-black/20">
          <AnimatePresence mode="wait">
            {llmResponse && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="leading-loose text-gray-200 whitespace-pre-line tracking-wide">
                {llmResponse}
                {isStreaming && <span className={`inline-block w-2.5 h-4 ml-1 align-middle animate-pulse bg-current ${visuals.color}`} />}
              </motion.div>
            )}
            {!llmResponse && !isStreaming && (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 italic space-y-3">
                <Cpu className="h-10 w-10 opacity-20" />
                <p className="opacity-50 tracking-widest text-xs uppercase">Terminal Online. Awaiting Directives.</p>
              </div>
            )}
          </AnimatePresence>
          <div ref={logEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 bg-black/60 border-t border-white/5 flex gap-3 relative z-10">
          <div className="relative flex-1 group">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold transition-colors duration-300 ${isStreaming ? 'text-gray-600' : 'text-[#00D4FF]'}`}>&gt;_</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Initialize operation..."
              className={`w-full bg-black/50 border border-white/10 rounded pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00D4FF]/50 focus:bg-black font-mono transition-all ${isStreaming ? 'opacity-50' : ''}`}
              disabled={isStreaming}
            />
          </div>
          <button
            type="submit"
            disabled={isStreaming}
            className="bg-transparent border border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF] hover:text-black disabled:border-gray-800 disabled:text-gray-600 font-bold px-6 py-2 rounded transition-all duration-300 flex items-center gap-2 text-sm tracking-widest uppercase shadow-[0_0_10px_rgba(0,212,255,0.1)] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]"
          >
            <Send className="h-4 w-4" /> Transmit
          </button>
        </form>

      </div>
    </div>
  );
}