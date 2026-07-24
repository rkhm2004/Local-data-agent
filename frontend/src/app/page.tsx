"use client";
import React, { useState } from "react";
import ParticleBg from "@/components/ParticleBg";
import ChatWindow from "@/components/ChatWindow";
import FileManager from "@/components/FileManager";
import { Terminal } from "lucide-react";

export default function Home() {
  const [logs, setLogs] = useState<string[]>([]);
  const [llmResponse, setLlmResponse] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const handleTriggerAgent = async (prompt: string) => {
    setLogs([]);
    setLlmResponse("");
    setIsStreaming(true);

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
      let currentEvent = ""; // Track what type of data is coming next

      while (!finished) {
        const { value, done } = await reader.read();
        finished = done;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          
          lines.forEach((line) => {
            // 1. Identify the event type (we can trim this safely)
            if (line.startsWith("event: ")) {
              currentEvent = line.substring(7).trim(); 
            } 
            // 2. Extract data WITHOUT trimming so we don't destroy spaces!
            else if (line.startsWith("data: ")) {
              const dataContent = line.substring(6); // Strips "data: " but keeps the spaces
              
              if (currentEvent === "processing" && dataContent.trim()) {
                setLogs((prev) => [...prev, dataContent.trim()]);
              } else if (currentEvent === "llm_chunk") {
                // Keep spaces, just format newlines
                const cleanContent = dataContent.replace(/\\n/g, "\n");
                setLlmResponse((prev) => prev + cleanContent);
              }
            }
          });
        }
      }
    } catch (error) {
      setLogs((prev) => [...prev, "❌ Terminal Connection Loss: Check backend running status."]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden bg-[#0A0A0A] text-gray-100 flex flex-col items-center justify-between p-6">
      <ParticleBg />
      
      <header className="z-10 w-full max-w-5xl flex items-center justify-between border-b border-[#FF6600]/20 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <Terminal className="text-[#FF6600] h-6 w-6 animate-pulse" />
          <h1 className="text-xl font-mono font-bold tracking-wider text-[#FF6600]">
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
          onSubmit={handleTriggerAgent} 
        />
      </section>
    </main>
  );
}