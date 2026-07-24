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

  // Dynamically change colors and speed based on LLM state!
  const config = useMemo(() => {
    let color = "#FF6600"; // Default Orange
    let speed = 0.8;
    let linkOpacity = 0.2;

    if (agentState === "searching") {
      color = "#00FFFF"; // Cyan
      speed = 2.5;
      linkOpacity = 0.4;
    } else if (agentState === "executing") {
      color = "#FF0033"; // Aggressive Red
      speed = 5.0;
      linkOpacity = 0.1;
    } else if (agentState === "streaming") {
      color = "#00FF66"; // Matrix Green
      speed = 1.5;
      linkOpacity = 0.3;
    }

    return {
      background: { color: { value: "transparent" } },
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
          value: 60,
        },
        opacity: { value: 0.5 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3 } },
      },
      detectRetina: true,
    };
  }, [agentState]);

  if (!init) return <></>;

  return (
    <div className="absolute inset-0 -z-10 transition-opacity duration-1000 ease-in-out">
      <Particles id="tsparticles" options={config as any} />
    </div>
  );
}