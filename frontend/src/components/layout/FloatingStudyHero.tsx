import { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

/*
  FloatingStudyHero — Canvas-powered animated study-themed visual
  Features: glowing orbs, floating knowledge nodes (code, math, AI topics),
  animated connecting lines like a neural/knowledge graph.
*/

const TOPICS = [
  { label: "Python", color: "#3b82f6" },
  { label: "ML", color: "#8b5cf6" },
  { label: "NLP", color: "#ec4899" },
  { label: "∑ Math", color: "#f59e0b" },
  { label: "AI", color: "#10b981" },
  { label: "</>Code", color: "#06b6d4" },
  { label: "Neural", color: "#f43f5e" },
  { label: "Data", color: "#a855f7" },
  { label: "GPT", color: "#22c55e" },
];

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  label: string;
  color: string;
  radius: number;
  phase: number;
}

export const FloatingStudyHero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let t = 0;

    // Build nodes
    const nodes: Node[] = TOPICS.map((topic, i) => ({
      x: (canvas.width / (TOPICS.length + 1)) * (i + 1) + (Math.random() - 0.5) * 80,
      y: canvas.height / 2 + (Math.random() - 0.5) * canvas.height * 0.6,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      label: topic.label,
      color: topic.color,
      radius: 32 + Math.random() * 12,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      // Reposition nodes on resize
      nodes.forEach((n, i) => {
        n.x = (canvas.width / (nodes.length + 1)) * (i + 1);
        n.y = canvas.height / 2 + (Math.random() - 0.5) * canvas.height * 0.5;
      });
    };
    resize();
    window.addEventListener("resize", resize);

    const drawGlowCircle = (x: number, y: number, r: number, color: string, alpha: number) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
      grad.addColorStop(0, color + "cc");
      grad.addColorStop(0.4, color + "55");
      grad.addColorStop(1, color + "00");
      ctx.beginPath();
      ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const drawNode = (node: Node, t: number) => {
      const bob = Math.sin(t * 0.8 + node.phase) * 6;
      const x = node.x;
      const y = node.y + bob;
      const r = node.radius;

      // Outer glow
      drawGlowCircle(x, y, r, node.color, 0.7);

      // Inner circle with gradient
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      grad.addColorStop(0, node.color + "ff");
      grad.addColorStop(0.6, node.color + "cc");
      grad.addColorStop(1, node.color + "88");

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = node.color;
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Border ring
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = node.color + "ff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.font = `bold ${Math.floor(r * 0.38)}px 'Inter', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#00000099";
      ctx.shadowBlur = 6;
      ctx.fillText(node.label, x, y);
      ctx.shadowBlur = 0;
    };

    const drawEdge = (a: Node, b: Node, t: number) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 240) return;

      const alpha = (1 - dist / 240) * 0.4;
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0, a.color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
      grad.addColorStop(1, b.color + Math.round(alpha * 255).toString(16).padStart(2, "0"));

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 8]);
      ctx.lineDashOffset = -t * 15;
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const tick = () => {
      t += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background ambient blobs
      [[canvas.width * 0.2, canvas.height * 0.3, "#6366f1"], [canvas.width * 0.8, canvas.height * 0.7, "#10b981"], [canvas.width * 0.5, canvas.height * 0.5, "#ec4899"]].forEach(([bx, by, bc]) => {
        drawGlowCircle(bx as number, by as number, 80, bc as string, 0.15);
      });

      // Physics: move nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < n.radius || n.x > canvas.width - n.radius) n.vx *= -1;
        if (n.y < n.radius || n.y > canvas.height - n.radius) n.vy *= -1;
      });

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          drawEdge(nodes[i], nodes[j], t);
        }
      }

      // Draw nodes on top
      nodes.forEach((n) => drawNode(n, t));

      raf = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [isDark]);

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
};
