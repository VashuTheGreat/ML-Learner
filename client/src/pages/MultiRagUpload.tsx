import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText, CheckCircle2, Loader2, ArrowRight, Trash2, X, Timer } from "lucide-react";
import { toast } from "sonner";
import multiRagApi from "@/services/multiRagApi";

interface QueuedFile {
  file: File;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
}

export default function MultiRagUpload() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"session" | "upload" | "ingest">("session");
  const [loading, setLoading] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(300);
  
  // File upload state
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Ingestion state
  const [ingestLogs, setIngestLogs] = useState<{ time: string; text: string; color: string }[]>([]);
  const [ingestStats, setIngestStats] = useState<{ files: number; docs: number } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const addLog = (text: string, color = "text-slate-400") => {
    const time = new Date().toLocaleTimeString();
    setIngestLogs((prev) => [...prev, { time, text, color }]);
  };

  const handleStartSession = async (seconds: number) => {
    setLoading(true);
    try {
      const res = await multiRagApi.initiate(seconds);
      if (res.success) {
        localStorage.setItem("multirag_session_start", Date.now().toString());
        localStorage.setItem("multirag_session_duration", seconds.toString());
        localStorage.setItem("multirag_thread_id", res.data.thread_id);
        
        // Dispatch event for components listening to storage updates
        window.dispatchEvent(new Event("storage"));
        
        toast.success(`Session started! Expires in ${seconds / 60} minutes.`);
        setPhase("upload");
      } else {
        toast.error(res.message || "Failed to start session.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to initiate session.");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const addFiles = (files: FileList) => {
    const newFiles: QueuedFile[] = Array.from(files).map((f) => ({
      file: f,
      progress: 0,
      status: "idle",
    }));

    setQueuedFiles((prev) => {
      // Filter out duplicate files by name and size
      const filtered = prev.filter(
        (existing) => !newFiles.some((n) => n.file.name === existing.file.name && n.file.size === existing.file.size)
      );
      return [...filtered, ...newFiles];
    });
  };

  const removeFile = (idx: number) => {
    setQueuedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearQueue = () => {
    setQueuedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadAndIngest = async () => {
    if (queuedFiles.length === 0) return;
    setLoading(true);
    setPhase("ingest");
    setIngestLogs([]);
    setIngestStats(null);
    setCountdown(null);

    addLog("🔍 Scanning and preparing files...", "text-slate-300");
    let successCount = 0;

    for (let i = 0; i < queuedFiles.length; i++) {
      const qf = queuedFiles[i];
      setUploadLabel(`Uploading ${qf.file.name}...`);
      
      setQueuedFiles((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: "uploading" } : item))
      );

      try {
        const res = await multiRagApi.upload(qf.file);
        if (res.success) {
          successCount++;
          setQueuedFiles((prev) =>
            prev.map((item, idx) => (idx === i ? { ...item, status: "success", progress: 100 } : item))
          );
        } else {
          setQueuedFiles((prev) =>
            prev.map((item, idx) => (idx === i ? { ...item, status: "error" } : item))
          );
        }
      } catch (err) {
        setQueuedFiles((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: "error" } : item))
        );
      }
      
      setUploadProgress(Math.round(((i + 1) / queuedFiles.length) * 100));
    }

    addLog(`Uploaded ${successCount}/${queuedFiles.length} files. Starting Ingestion...`, "text-indigo-300");
    
    // Simulate initial phase logs
    const fakeLogs = [
      { text: "📦 Chunking documents into semantic passages...", color: "text-slate-300" },
      { text: "🧬 Generating embeddings with all-MiniLM-L6-v2 model...", color: "text-indigo-300" },
      { text: "🕸️ Constructing hierarchical knowledge graph edges...", color: "text-purple-300" },
      { text: "🗄️ Persisting vector stores to user session storage...", color: "text-slate-300" },
      { text: "⚡ Optimizing HNSW indices for ultra-low latency searches...", color: "text-yellow-300" },
    ];

    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < fakeLogs.length) {
        addLog(fakeLogs[logIdx].text, fakeLogs[logIdx].color);
        logIdx++;
      } else {
        clearInterval(interval);
      }
    }, 1000);

    try {
      const ingestRes = await multiRagApi.ingest();
      clearInterval(interval);
      
      if (ingestRes.success) {
        addLog("✅ Ingestion complete! Knowledge base is fully indexed.", "text-green-400");
        setIngestStats({
          files: ingestRes.data.files_processed,
          docs: Array.isArray(ingestRes.data.all_docs) ? ingestRes.data.all_docs.length : ingestRes.data.all_docs || 0,
        });

        // Trigger countdown to chat page
        let count = 3;
        setCountdown(count);
        const countInterval = setInterval(() => {
          count--;
          setCountdown(count);
          if (count <= 0) {
            clearInterval(countInterval);
            navigate("/multirag/chat");
          }
        }, 1000);
      } else {
        addLog(`❌ Ingestion failed: ${ingestRes.message}`, "text-red-400");
      }
    } catch (err: any) {
      clearInterval(interval);
      addLog(`❌ Ingestion Error: ${err.response?.data?.message || err.message}`, "text-red-400");
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "📄";
    if (["csv", "xlsx", "xls"].includes(ext || "")) return "📊";
    if (["png", "jpg", "jpeg", "gif"].includes(ext || "")) return "🖼️";
    return "📎";
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl -z-10 animate-pulse"></div>

      {phase === "session" && (
        <div className="max-w-md mx-auto w-full space-y-8 animate-fade-in">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border border-indigo-500/20">
              <Timer className="w-3.5 h-3.5" />
              <span>Session Setup</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">How long do you need?</h1>
            <p className="text-slate-400 text-sm">
              Your session and its vector indexes will be automatically wiped after the timer expires.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              { seconds: 300, label: "5 Minutes", desc: "Perfect for quick testing and small files", icon: "⏱" },
              { seconds: 900, label: "15 Minutes", desc: "Standard session for simple documents", icon: "🕒" },
              { seconds: 3600, label: "1 Hour", desc: "Extended session for deep, multi-file research", icon: "⏳" },
            ].map((opt) => (
              <button
                key={opt.seconds}
                onClick={() => handleStartSession(opt.seconds)}
                disabled={loading}
                className="group relative w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all duration-300 text-left disabled:opacity-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
                    {opt.icon}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{opt.label}</p>
                    <p className="text-slate-500 text-xs">{opt.desc}</p>
                  </div>
                </div>
                {loading ? (
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                ) : (
                  <ArrowRight className="text-indigo-400 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "upload" && (
        <div className="max-w-2xl mx-auto w-full space-y-8 animate-fade-in">
          {/* Step indicator */}
          <div className="flex items-center space-x-2 text-xs font-bold">
            <span className="bg-indigo-500/20 border-indigo-500/50 text-indigo-300 px-3 py-1 rounded-full border">
              1. Upload
            </span>
            <span className="flex-1 h-px bg-white/10"></span>
            <span className="text-slate-500 px-3 py-1 rounded-full border border-white/5">2. Ingest</span>
            <span className="flex-1 h-px bg-white/10"></span>
            <span className="text-slate-500 px-3 py-1 rounded-full border border-white/5">3. Chat</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Upload your documents</h2>
            <p className="text-slate-400 text-sm">PDFs, CSVs, Excel, images or TXT files supported.</p>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-2xl p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer text-center select-none border-2 border-dashed transition-all duration-300 ${
              isDragOver
                ? "border-indigo-500 bg-indigo-500/5 scale-[1.01]"
                : "border-white/10 bg-slate-900/30 hover:border-white/20"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
              📂
            </div>
            <div>
              <p className="text-white font-bold text-base">Drag & drop files here</p>
              <p className="text-slate-500 text-xs mt-1">or click to browse local files</p>
            </div>
          </div>

          {/* File Queue */}
          {queuedFiles.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Queued files</p>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {queuedFiles.map((qf, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="text-lg flex-shrink-0">{getFileIcon(qf.file.name)}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-white font-semibold truncate max-w-[260px]">{qf.file.name}</p>
                        <p className="text-slate-500 text-xs">{formatBytes(qf.file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      className="text-slate-500 hover:text-red-400 transition-colors text-lg"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {queuedFiles.length > 0 && (
              <button
                onClick={clearQueue}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-sm font-semibold transition-all duration-200 border border-white/5 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            )}
            <button
              onClick={handleUploadAndIngest}
              disabled={queuedFiles.length === 0 || loading}
              className="flex-1 inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold shadow-lg shadow-indigo-500/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Upload & Ingest →
            </button>
          </div>
        </div>
      )}

      {phase === "ingest" && (
        <div className="max-w-2xl mx-auto w-full space-y-8 animate-fade-in">
          {/* Step indicator */}
          <div className="flex items-center space-x-2 text-xs font-bold">
            <span className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full border">
              ✓ Uploaded
            </span>
            <span className="flex-1 h-px bg-white/10"></span>
            <span className="bg-indigo-500/20 border-indigo-500/50 text-indigo-300 px-3 py-1 rounded-full border animate-pulse">
              2. Ingesting
            </span>
            <span className="flex-1 h-px bg-white/10"></span>
            <span className="text-slate-500 px-3 py-1 rounded-full border border-white/5">3. Chat</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <span>{countdown !== null ? "Ingestion Complete!" : "Processing Knowledge base..."}</span>
              {countdown === null && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
            </h2>
            <p className="text-slate-400 text-sm">
              Vectorizing, embedding, and linking database structures. Please don't close this window.
            </p>
          </div>

          {/* Glowing Central Orb */}
          <div className="flex justify-center py-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping" style={{ animationDuration: "2s" }}></div>
              <div className="absolute inset-2 rounded-full bg-indigo-500/15 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}></div>
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.6)]">
                <span className="text-3xl">{countdown !== null ? "✅" : "🧠"}</span>
              </div>
            </div>
          </div>

          {/* Progress bar (if uploading) */}
          {loading && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{uploadLabel}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Console Output */}
          <div className="rounded-2xl bg-slate-950/70 border border-white/5 p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
              <span className="text-slate-600 ml-2">ingestion.log</span>
              {countdown === null && <span className="ml-auto text-green-400 animate-pulse">● Live</span>}
            </div>
            <div className="space-y-1.5 min-h-[120px] max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {ingestLogs.map((log, i) => (
                <div key={i} className={`flex items-start space-x-2 ${log.color}`}>
                  <span className="text-slate-600 select-none">{log.time}</span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ingest stats */}
          {ingestStats && (
            <div className="grid grid-cols-2 gap-4 animate-scale-in">
              <div className="rounded-xl bg-slate-900/50 border border-white/5 p-4 text-center space-y-1">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Processed Files</p>
                <p className="text-2xl font-black text-white">{ingestStats.files}</p>
              </div>
              <div className="rounded-xl bg-slate-900/50 border border-white/5 p-4 text-center space-y-1">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Indexed Documents</p>
                <p className="text-2xl font-black text-indigo-400">{ingestStats.docs}</p>
              </div>
            </div>
          )}

          {/* Countdown redirect button */}
          {countdown !== null && (
            <button
              onClick={() => navigate("/multirag/chat")}
              className="w-full inline-flex items-center justify-center px-6 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-extrabold shadow-lg shadow-green-500/20 transition-all duration-300 text-lg"
            >
              🚀 Opening Chat {countdown > 0 ? `in ${countdown}s` : ""} — Go Now
            </button>
          )}
        </div>
      )}
    </div>
  );
}
