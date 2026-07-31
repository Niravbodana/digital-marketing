"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; z: number; size: number };

export function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let animId = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      stars = Array.from({ length: 180 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 1.5 + 0.2,
        size: Math.random() * 1.8 + 0.3,
      }));
    };

    const draw = () => {
      ctx.fillStyle = "rgba(3, 3, 8, 0.25)";
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        s.y += s.z * 0.6;
        if (s.y > h) {
          s.y = -2;
          s.x = Math.random() * w;
        }
        const alpha = 0.3 + s.z * 0.4;
        ctx.beginPath();
        ctx.fillStyle = `rgba(200, 210, 255, ${alpha})`;
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 opacity-80" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(88,28,135,0.25),transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(249,115,22,0.12),transparent_40%),radial-gradient(ellipse_at_10%_90%,rgba(59,130,246,0.1),transparent_35%)]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" aria-hidden />
    </>
  );
}
