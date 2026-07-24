"use client";
import React, { useState } from "react";
import ParticleBg from "@/components/ParticleBg";
import ChatWindow from "@/components/ChatWindow";
import FileManager from "@/components/FileManager";

export type AgentState = "idle" | "searching" | "executing" | "streaming";

export interface Message {
  role: "user" | "ai";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]); 
  const [currentStream, setCurrentStream] = useState<string>(""); 
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [agentState, setAgentState] = useState<AgentState>("idle");

  const handleTriggerAgent = async (prompt: string) => {
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setCurrentStream("");
    setIsStreaming(true);
    setAgentState("executing"); 

    try {
      const response = await fetch("http://localhost:8000/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, history: messages }), 
      });

      if (!response?.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let finished = false;
      let fullResponse = ""; 

      while (!finished) {
        const { value, done } = await reader.read();
        finished = done;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          
          lines.forEach((line) => {
            if (line.startsWith("data: ") && !line.includes("event: processing")) {
              const dataContent = line.substring(6); 
              setAgentState("streaming");
              const cleanContent = dataContent.replace(/\\n/g, "\n");
              fullResponse += cleanContent;
              setCurrentStream((prev) => prev + cleanContent);
            }
          });
        }
      }
      
      if (fullResponse) {
        setMessages((prev) => [...prev, { role: "ai", content: fullResponse }]);
        setCurrentStream("");
      }

    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", content: "❌ Terminal Connection Loss..." }]);
    } finally {
      setIsStreaming(false);
      setAgentState("idle");
    }
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-transparent text-gray-100 flex flex-col items-center justify-center p-4 md:p-8 font-mono">
      <ParticleBg agentState={agentState} />
      <div className="pointer-events-none fixed inset-0 z-50 h-full w-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-20" />
      <div className="absolute top-6 right-6 z-50">
        <FileManager />
      </div>

      <section className="z-10 w-full max-w-7xl h-[85vh] flex">
        <ChatWindow 
          messages={messages}
          currentStream={currentStream}
          isStreaming={isStreaming} 
          agentState={agentState}
          onSubmit={handleTriggerAgent} 
        />
      </section>
    </main>
  );
}