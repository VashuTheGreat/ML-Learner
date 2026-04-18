import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, VideoOff, ShieldAlert, ShieldCheck, Users } from 'lucide-react';

interface FaceDetectionVideoProps {
  isVideoOn: boolean;
  isMicOn: boolean;
  isListening: boolean;
  hasStarted: boolean;
  isAnalyzing: boolean;
  className?: string;
}

type FaceStatus = 'ok' | 'none' | 'multiple' | null;

const WS_URL = `${import.meta.env.VITE_PYTHON_BASE_URL?.replace('http', 'ws') || 'ws://localhost:8000'}/api/face/findFace`;

export const FaceDetectionVideo: React.FC<FaceDetectionVideoProps> = ({
  isVideoOn,
  isMicOn,
  isListening,
  hasStarted,
  isAnalyzing,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [faceStatus, setFaceStatus] = useState<FaceStatus>(null);
  const [faceCount, setFaceCount] = useState<number>(0);
  const isActiveRef = useRef(false);

  const connectWs = useCallback(() => {
    if (!isActiveRef.current) return;
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isActiveRef.current) { ws.close(); return; }

      // Start sending frames once connection is open
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (!isActiveRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas && video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(blob);
              }
            }, 'image/jpeg', 0.6);
          }
        }
      }, 1000); // 1 FPS
    };

    ws.onmessage = (event) => {
      if (!isActiveRef.current) return;
      try {
        const data = JSON.parse(event.data);
        if (!data.is_error) {
          setFaceStatus('ok');
          setFaceCount(1);
        } else if (data.face_count > 1 || (data.error_message?.toLowerCase().includes('faces'))) {
          setFaceStatus('multiple');
          setFaceCount(data.face_count || 2);
        } else {
          setFaceStatus('none');
          setFaceCount(0);
        }
      } catch {
        // JSON parse error, ignore
      }
    };

    ws.onerror = () => {
      if (isActiveRef.current) setFaceStatus(null);
    };

    ws.onclose = () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      // Auto-reconnect after 2s if still active
      if (isActiveRef.current) {
        setTimeout(() => connectWs(), 2000);
      }
    };
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const setup = async () => {
      if (!isVideoOn || !hasStarted || isAnalyzing) return;

      isActiveRef.current = true;

      // Start webcam
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (isActiveRef.current && videoRef.current) {
          videoRef.current.srcObject = stream;
        } else {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
      } catch (err) {
        console.error('Webcam access denied:', err);
        return;
      }

      // Connect WebSocket
      connectWs();
    };

    if (isVideoOn && hasStarted && !isAnalyzing) {
      setup();
    } else {
      isActiveRef.current = false;
      setFaceStatus(null);
    }

    return () => {
      isActiveRef.current = false;
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close();
      }
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [isVideoOn, hasStarted, isAnalyzing, connectWs]);

  const renderOverlay = () => {
    if (faceStatus === 'ok') {
      return (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-green-500/20 border border-green-500/40 backdrop-blur-sm rounded-full text-xs font-semibold text-green-400 z-20 whitespace-nowrap">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          Face Detected
        </div>
      );
    }
    if (faceStatus === 'none') {
      return (
        <>
          <div className="absolute inset-0 bg-red-500/20 z-10 pointer-events-none" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-red-600/80 border border-red-500/50 backdrop-blur-sm rounded-full text-xs font-semibold text-white z-20 animate-pulse whitespace-nowrap">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            No Face Detected
          </div>
        </>
      );
    }
    if (faceStatus === 'multiple') {
      return (
        <>
          <div className="absolute inset-0 bg-amber-500/20 z-10 pointer-events-none" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-amber-500/80 border border-amber-400/50 backdrop-blur-sm rounded-full text-xs font-semibold text-white z-20 whitespace-nowrap">
            <Users className="w-3.5 h-3.5 shrink-0" />
            {faceCount > 1 ? `${faceCount} Faces Detected` : 'Multiple Faces Detected'}
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className={className || "h-48 bg-secondary/20 rounded-2xl relative overflow-hidden border border-border/50 shrink-0"}>
      {isVideoOn ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          {renderOverlay()}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
          <VideoOff className="w-12 h-12 text-muted-foreground/30" />
        </div>
      )}

      <div className="absolute top-3 left-3 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium z-30">
        You
      </div>

      {!isMicOn && (
        <div className="absolute top-3 right-3 p-1.5 bg-destructive/20 rounded-full z-30">
          <MicOff className="w-4 h-4 text-destructive" />
        </div>
      )}

      {isListening && isMicOn && (
        <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full text-xs font-medium text-green-500 animate-pulse z-30">
          <Mic className="w-3 h-3" /> Listening...
        </div>
      )}
    </div>
  );
};
