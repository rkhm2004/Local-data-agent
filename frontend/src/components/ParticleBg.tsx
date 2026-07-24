"use client";
import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { AgentState } from "@/app/page";

export default function ParticleBg({ agentState }: { agentState: AgentState }) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const config = useMemo(() => {
    let color = "#FF6600"; // Default Orange (Idle)
    let speed = 0.8;
    let linkOpacity = 0.2;

    if (agentState === "searching") {
      color = "#00FFFF"; // Cyan
      speed = 3.0;
      linkOpacity = 0.5;
    } else if (agentState === "executing") {
      color = "#FF0033"; // Aggressive Red
      speed = 6.0;
      linkOpacity = 0.6;
    } else if (agentState === "streaming") {
      color = "#00FF66"; // Matrix Green
      speed = 2.0;
      linkOpacity = 0.4;
    }

    return {
      fullScreen: { enable: true, zIndex: -1 }, // <-- THE FIX: Forces particles behind content
      background: { color: { value: "#050505" } }, // <-- THE FIX: Moves the dark background here
      fpsLimit: 60,
      particles: {
        color: { value: color },
        links: {
          color: color,
          distance: 150,
          enable: true,
          opacity: linkOpacity,
          width: 1,
        },
        move: {
          enable: true,
          speed: speed,
          direction: agentState === "streaming" ? "bottom" : "none",
          random: true,
          straight: false,
          outModes: { default: "bounce" },
        },
        number: {
          density: { enable: true, area: 800 },
          value: 80, // Increased particle count slightly for better visuals
        },
        opacity: { value: 0.6 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3 } },
      },
      detectRetina: true,
    };
  }, [agentState]);

  if (!init) return <></>;

  // Removed the absolute wrapper div to prevent layer clashing
  return <Particles id="tsparticles" options={config as any} />;
}