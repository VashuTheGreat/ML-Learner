import { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export const CanvasBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { themeId, isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrameId: number;

    // -------------------------------------------------------------
    // VIDEO FRAME SEQUENCE SETTINGS
    // -------------------------------------------------------------
    const frameCount = 148; // Total number of images extracted from video
    
    // REPLACE THIS URL with your own local image sequence path
    // Example for your own project:
    const currentFrame = (index: number) => 
      `/video-frames/frame_${index.toString().padStart(4, '0')}.jpg`;

    const images: HTMLImageElement[] = [];
    let imagesLoaded = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(window.scrollY);
    };

    window.addEventListener("resize", resize);
    resize();

    // Preload all frames to ensure buttery smooth scrolling
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === 1) {
          // Render the very first frame immediately once loaded
          renderFrame(window.scrollY);
        }
      };
      images.push(img);
    }

    function renderFrame(scrollY: number) {
      if (!canvas || !context) return;
      
      // Calculate how far down the user has scrolled
      const html = document.documentElement;
      const maxScroll = Math.max(html.scrollHeight - window.innerHeight, 1);
      const scrollFraction = Math.max(0, Math.min(scrollY / maxScroll, 1));
      
      // Map scroll fraction to a specific frame index
      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
      );

      const img = images[frameIndex];
      
      context.clearRect(0, 0, canvas.width, canvas.height);

      if (img && img.complete && img.naturalHeight !== 0) {
        // Draw the image imitating object-fit: cover 
        // (preserves aspect ratio and fully covers the screen)
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;
        
        context.drawImage(
          img, 
          0, 0, img.width, img.height,
          centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
        );
      } else {
        // Subtle fallback if images are missing or loading
        drawGenerativeFallback(context, canvas.width, canvas.height, scrollFraction);
      }
    }

    function drawGenerativeFallback(ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) {
        ctx.fillStyle = isDark ? "#0f0f13" : "#f1f5f9";
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
        ctx.lineWidth = 2;
        const size = 50;
        const offset = progress * 400; 
        ctx.beginPath();
        for (let x = 0; x <= width; x += size) {
            for (let y = 0; y <= height; y += size) {
                const wave = Math.sin((x + offset) * 0.01) * Math.cos((y + offset) * 0.01) * 50;
                ctx.moveTo(x + wave, y);
                ctx.lineTo(x + wave + 10, y + 10);
            }
        }
        ctx.stroke();
    }

    const handleScroll = () => {
      // requestAnimationFrame ensures smooth repainting synced with display refresh rate
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        renderFrame(window.scrollY);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", resize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  const getHueShift = () => {
    switch (themeId) {
      case "violet": return "hue-rotate(70deg)";
      case "emerald": return "hue-rotate(-40deg)";
      case "amber": return "hue-rotate(-160deg)";
      case "rose": return "hue-rotate(150deg)";
      case "cyber": return "hue-rotate(120deg)";
      case "aurora": return "hue-rotate(-30deg)";
      case "nebula": return "hue-rotate(60deg)";
      case "solaris": return "hue-rotate(-140deg)";
      case "prism": return "hue-rotate(220deg) saturate(1.5)";
      default: return "none";
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        style={{ filter: getHueShift() }}
        className="w-full h-full opacity-60 dark:opacity-80 transition-opacity duration-1000 object-cover" 
      />
      {/* Increased tint to keep text readable against busy video frames */}
      <div className="absolute inset-0 bg-background/40 dark:bg-background/20"></div>
    </div>
  );
};
