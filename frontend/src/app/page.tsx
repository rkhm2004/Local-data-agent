"use client";
import React, { useState } from "react";
import ParticleBg from "@/components/ParticleBg";
import ChatWindow from "@/components/ChatWindow";
import FileManager from "@/components/FileManager";

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
    setAgentState("searching"); 

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
    <main className="relative h-screen w-screen overflow-hidden bg-transparent text-gray-100 flex flex-col items-center justify-center p-4 md:p-8 font-mono">
      {/* Dynamic Background */}
      <ParticleBg agentState={agentState} />
      
      {/* CRT Scanline Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 h-full w-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-20" />

      {/* Floating File Manager */}
      <div className="absolute top-6 right-6 z-50">
        <FileManager />
      </div>

      {/* Main App Container - Widened for Side-by-Side layout */}
      <section className="z-10 w-full max-w-7xl h-[85vh] flex">
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