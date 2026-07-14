"use client";
import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function ParticleBg() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      className="absolute inset-0 -z-10"
      options={{
        background: { color: { value: "transparent" } },
        fpsLimit: 120,
        interactivity: {
          events: { onHover: { enable: true, mode: "grab" } },
          modes: { grab: { distance: 140, links: { opacity: 0.5, color: "#FF6600" } } },
        },
        particles: {
          color: { value: "#FF6600" },
          links: { color: "#FF6600", distance: 150, enable: true, opacity: 0.15, width: 1 },
          move: { enable: true, speed: 1.2, direction: "none", random: false, straight: false },
          number: { value: 60, density: { enable: true, dangerouslyDisableResolutionOptimization: false } },
          opacity: { value: 0.3 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
      }}
    />
  );
}