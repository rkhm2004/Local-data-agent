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

  // Status visualizer mapping
  const getStatusVisuals = () => {
    switch (agentState) {
      case "searching": return { color: "text-cyan-400", border: "border-cyan-500/50", glow: "shadow-[0_0_30px_rgba(0,255,255,0.15)]", icon: <Database className="h-4 w-4 animate-pulse" /> };
      case "executing": return { color: "text-red-500", border: "border-red-500/50", glow: "shadow-[0_0_40px_rgba(255,0,51,0.2)]", icon: <Zap className="h-4 w-4 animate-bounce" /> };
      case "streaming": return { color: "text-emerald-400", border: "border-emerald-500/50", glow: "shadow-[0_0_30px_rgba(0,255,102,0.15)]", icon: <Cpu className="h-4 w-4 animate-pulse" /> };
      default: return { color: "text-[#FF6600]", border: "border-[#FF6600]/30", glow: "shadow-[0_0_30px_rgba(255,102,0,0.05)]", icon: <Cpu className="h-4 w-4" /> };
    }
  };

  const visuals = getStatusVisuals();

  return (
    <div className={`flex flex-col h-[75vh] bg-[#0A0A0A]/95 border ${visuals.border} rounded-lg ${visuals.glow} backdrop-blur-xl overflow-hidden font-mono transition-all duration-700 relative`}>
      
      {/* Top Telemetry Panel */}
      <div className="h-1/3 border-b border-white/5 bg-black/60 p-5 overflow-y-auto text-xs text-emerald-400 relative">
        <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
        <div className={`flex items-center gap-2 mb-3 pb-2 border-b border-white/10 ${visuals.color} uppercase tracking-[0.15em] text-[10px] font-bold transition-colors duration-500`}>
          <Activity className="h-3 w-3 animate-pulse" /> Live System Telemetry
          <span className="ml-auto text-[8px] tracking-widest opacity-50">SYS.TRACE.ON</span>
        </div>
        {logs && logs.map((log, i) => (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="mb-1.5 opacity-90">
            {log}
          </motion.div>
        ))}
        {isStreaming && (!logs || logs.length === 0) && (
          <span className="animate-pulse text-gray-600">Awaiting system instructions...</span>
        )}
      </div>

      {/* Main Output Panel */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 text-sm bg-gradient-to-b from-transparent to-black/40">
        <div className={`flex items-center gap-2 ${visuals.color} uppercase tracking-[0.15em] text-[10px] font-bold mb-4 opacity-70 transition-colors duration-500`}>
          {visuals.icon} 
          <span>Response Node {agentState !== "idle" && `[${agentState.toUpperCase()}]`}</span>
        </div>
        <AnimatePresence mode="wait">
          {llmResponse && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="leading-loose text-gray-200 whitespace-pre-line tracking-wide">
              {llmResponse}
              {isStreaming && <span className={`inline-block w-2.5 h-4 ml-1 align-middle animate-pulse bg-current ${visuals.color}`} />}
            </motion.div>
          )}
          {!llmResponse && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-full text-gray-700 italic opacity-50 space-y-2">
              <Cpu className="h-8 w-8 mb-2" />
              <p>System idle. Awaiting operational parameters...</p>
            </div>
          )}
        </AnimatePresence>
        <div ref={logEndRef} />
      </div>

      {/* Control Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-black/80 border-t border-white/5 flex gap-3 relative z-10">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6600] font-bold">&gt;_</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Initialize operation..."
            className={`w-full bg-[#111] border border-white/10 rounded-md pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-transparent focus:ring-1 focus:ring-[#FF6600] font-mono transition-all ${isStreaming ? 'opacity-50' : ''}`}
            disabled={isStreaming}
          />
        </div>
        <button
          type="submit"
          disabled={isStreaming}
          className="bg-transparent border border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600] hover:text-black disabled:border-gray-800 disabled:text-gray-600 font-bold px-6 py-2 rounded-md transition-all duration-300 flex items-center gap-2 text-sm tracking-widest uppercase shadow-[0_0_10px_rgba(255,102,0,0.1)] hover:shadow-[0_0_20px_rgba(255,102,0,0.4)]"
        >
          <Send className="h-4 w-4" /> Transmit
        </button>
      </form>
    </div>
  );
}