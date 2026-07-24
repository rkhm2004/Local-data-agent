"use client";
import React, { useState } from "react";
import ParticleBg from "@/components/ParticleBg";
import ChatWindow from "@/components/ChatWindow";
import FileManager from "@/components/FileManager";
import { Terminal } from "lucide-react";

export type AgentState = "idle" | "searching" | "executing" | "streaming";

export default function Home() {
  const [logs, setLogs] = useState<string[]>([]);
  const [llmResponse, setLlmResponse] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [agentState, setAgentState] = useState<AgentState>("idle");

  const handleTriggerAgent = async (prompt: string) => {
    setLogs([]);
    setLlmResponse("");
    setIsStreaming(true);
    setAgentState("searching"); // Initial state when trigger is hit

    try {
      const response = await fetch("http://localhost:8000/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });

      if (!response?.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let finished = false;
      let currentEvent = ""; 

      while (!finished) {
        const { value, done } = await reader.read();
        finished = done;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          
          lines.forEach((line) => {
            if (line.startsWith("event: ")) {
              currentEvent = line.substring(7).trim(); 
            } 
            else if (line.startsWith("data: ")) {
              const dataContent = line.substring(6); 
              
              if (currentEvent === "processing" && dataContent.trim()) {
                setLogs((prev) => [...prev, dataContent.trim()]);
                // Shift state based on telemetry text
                if (dataContent.includes("thinking and executing")) {
                  setAgentState("executing");
                }
              } else if (currentEvent === "llm_chunk") {
                setAgentState("streaming");
                const cleanContent = dataContent.replace(/\\n/g, "\n");
                setLlmResponse((prev) => prev + cleanContent);
              }
            }
          });
        }
      }
    } catch (error) {
      setLogs((prev) => [...prev, "❌ Terminal Connection Loss..."]);
    } finally {
      setIsStreaming(false);
      setAgentState("idle");
    }
  };

  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden bg-transparent text-gray-100 flex flex-col items-center justify-between p-6 font-mono">
      {/* Dynamic Background */}
      <ParticleBg agentState={agentState} />
      
      {/* CRT Scanline Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 h-full w-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-20" />

      <header className="z-10 w-full max-w-5xl flex items-center justify-between border-b border-[#FF6600]/30 pb-4 mb-4 relative">
        <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-50" />
        <div className="flex items-center gap-3">
          <Terminal className="text-[#FF6600] h-6 w-6 animate-pulse drop-shadow-[0_0_8px_rgba(255,102,0,0.8)]" />
          <h1 className="text-xl font-bold tracking-[0.2em] text-[#FF6600] drop-shadow-[0_0_5px_rgba(255,102,0,0.5)]">
            CORE_AGENT // OPERATIONAL_INTERFACE
          </h1>
        </div>
        <FileManager />
      </header>

      <section className="z-10 w-full max-w-5xl flex-1 grid grid-cols-1 gap-6 my-auto">
        <ChatWindow 
          logs={logs} 
          llmResponse={llmResponse} 
          isStreaming={isStreaming} 
          agentState={agentState}
          onSubmit={handleTriggerAgent} 
        />
      </section>
    </main>
  );
}