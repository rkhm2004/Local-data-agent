"use client";
import { useState } from "react";
import { Download, Loader2, CheckCircle } from "lucide-react";

export default function FileManager() {
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "success">("idle");

  const triggerDownload = async () => {
    setDownloadState("loading");
    try {
      const response = await fetch("http://localhost:8000/api/download/zip");
      if (!response.ok) throw new Error("Export failure");
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "agent_data_payload.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setDownloadState("success");
      setTimeout(() => setDownloadState("idle"), 3000);
    } catch (err) {
      setDownloadState("idle");
      alert("Backend runtime packaging error occurred during file serialization.");
    }
  };

  return (
    <button
      onClick={triggerDownload}
      disabled={downloadState === "loading"}
      className="flex items-center gap-2 border border-brand-orange/40 bg-brand-orange/5 hover:bg-brand-orange/20 font-mono text-xs uppercase text-brand-orange font-bold px-4 py-2 rounded transition-all duration-300 disabled:cursor-not-allowed"
    >
      {downloadState === "idle" && (
        <>
          <Download className="h-4 w-4" /> Export payload.zip
        </>
      )}
      {downloadState === "loading" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Packaging Data...
        </>
      )}
      {downloadState === "success" && (
        <>
          <CheckCircle className="h-4 w-4 text-emerald-400" /> Download Dispatched
        </>
      )}
    </button>
  );
}