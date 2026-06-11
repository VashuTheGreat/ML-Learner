import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Send, FileText, Bot, Search, RefreshCw, X, Image as ImageIcon, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import multiRagApi from "@/services/multiRagApi";

interface Message {
  type: "human" | "ai";
  content: string;
}

interface DocMetadata {
  source?: string;
  file_name?: string;
  page?: number;
  types?: string;
  type?: string;
  content_type?: string;
  has_images?: boolean | string;
  images?: string;
  image_path?: string;
  tables?: string;
  [key: string]: any;
}

interface IngestedDoc {
  page_content?: string;
  content?: string;
  metadata?: DocMetadata;
}

export default function MultiRagChat() {
  const [activeTab, setActiveTab] = useState<"chat" | "docs">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [waiting, setWaiting] = useState(false);

  // Docs state
  const [docs, setDocs] = useState<IngestedDoc[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<IngestedDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsLoaded, setDocsLoaded] = useState(false);

  // Modal state
  const [selectedDoc, setSelectedDoc] = useState<{ doc: IngestedDoc; idx: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await multiRagApi.loadConversation();
        if (res.success && Array.isArray(res.data.messages)) {
          const formatted = res.data.messages.map((m: any) => ({
            type: m.type === "human" || m.role === "user" ? "human" : "ai",
            content: m.content || m.text || "",
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    fetchHistory();
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, waiting]);

  // Load docs when switching to docs tab
  useEffect(() => {
    if (activeTab === "docs" && !docsLoaded) {
      loadDocuments();
    }
  }, [activeTab, docsLoaded]);

  const loadDocuments = async () => {
    setDocsLoading(true);
    try {
      const res = await multiRagApi.ingest();
      if (res.success && Array.isArray(res.data.all_docs)) {
        setDocs(res.data.all_docs);
        setFilteredDocs(res.data.all_docs);
        setDocsLoaded(true);
      } else {
        toast.error(res.message || "Failed to load documents.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to fetch documents.");
    } finally {
      setDocsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredDocs(docs);
      return;
    }
    const q = query.toLowerCase();
    const filtered = docs.filter((d) => {
      const text = ((d.page_content || d.content || "") + JSON.stringify(d.metadata || "")).toLowerCase();
      return text.includes(q);
    });
    setFilteredDocs(filtered);
  };

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || waiting) return;

    setWaiting(true);
    setInputText("");
    setMessages((prev) => [...prev, { type: "human", content: text }]);

    try {
      const res = await multiRagApi.chat(text);
      if (res.success) {
        setMessages((prev) => [...prev, { type: "ai", content: res.data.response || "No response." }]);
      } else {
        setMessages((prev) => [...prev, { type: "ai", content: `❌ Error: ${res.message}` }]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { type: "ai", content: `❌ Network error: ${err.response?.data?.message || err.message}` },
      ]);
    } finally {
      setWaiting(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const escHtml = (str: string) => {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  const renderMarkdown = (md: string) => {
    // Basic Custom Markdown to HTML Converter
    const html = md
      .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre class="bg-slate-950 border border-white/5 rounded-xl p-4 overflow-x-auto my-3 text-xs font-mono text-slate-300"><code class="lang-${lang}">${escHtml(code.trim())}</code></pre>`;
      })
      .replace(/`([^`]+)`/g, '<code class="bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
      .replace(/^### (.+)$/gm, '<h3 class="text-white font-bold text-sm mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-white font-bold text-base mt-5 mb-2.5">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-white font-extrabold text-lg mt-6 mb-3">$1</h1>')
      .replace(/^\s*[-*] (.+)$/gm, '<li class="ml-4 list-disc text-slate-300 my-1">$1</li>')
      .replace(/\n\n/g, "</p><p class='my-2.5 leading-relaxed text-slate-300'>");

    return `<p class='leading-relaxed text-slate-300'>${html}</p>`;
  };

  const buildImgSrc = (raw: string | undefined) => {
    if (!raw) return "";
    const s = String(raw).trim();
    if (!s || s.length < 20) return "";
    if (s.startsWith("data:")) return s;
    if (/^[A-Za-z0-9+/=]{20,}$/.test(s.replace(/\s/g, ""))) {
      return "data:image/jpeg;base64," + s.replace(/\s/g, "");
    }
    return s;
  };

  const renderTableValue = (raw: string | undefined) => {
    if (!raw) return "";
    const s = String(raw).trim();
    if (!s) return "";
    if (/<table/i.test(s)) return s;

    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed) && parsed.length) {
        const isObjArray = typeof parsed[0] === "object" && !Array.isArray(parsed[0]);
        if (isObjArray) {
          const keys = Object.keys(parsed[0]);
          return `<table class="w-full text-xs text-left border-collapse border border-white/5 my-3">
            <thead><tr class="bg-indigo-500/10 text-indigo-300 font-bold">${keys
              .map((k) => `<th class="p-2 border border-white/5">${escHtml(k)}</th>`)
              .join("")}</tr></thead>
            <tbody>${parsed
              .map(
                (row) =>
                  `<tr>${keys
                    .map((k) => `<td class="p-2 border border-white/5 text-slate-300">${escHtml(String(row[k] ?? ""))}</td>`)
                    .join("")}</tr>`
              )
              .join("")}</tbody></table>`;
        }
      }
    } catch {
      // ignore JSON parse error
    }

    return `<pre class="text-slate-400 text-xs whitespace-pre-wrap bg-slate-950 p-3 rounded-lg font-mono">${escHtml(s)}</pre>`;
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Tab Bar */}
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-5 py-2 rounded-xl border text-sm font-bold transition-all ${
              activeTab === "chat"
                ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-300"
                : "border-white/5 text-slate-400 hover:text-white"
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-5 py-2 rounded-xl border text-sm font-bold transition-all ${
              activeTab === "docs"
                ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-300"
                : "border-white/5 text-slate-400 hover:text-white"
            }`}
          >
            📄 View Ingested Docs
          </button>
        </div>
        <Link
          to="/multirag"
          className="text-xs text-slate-500 hover:text-indigo-400 transition font-semibold"
        >
          ← Upload more
        </Link>
      </div>

      {/* Panel 1: Chat */}
      {activeTab === "chat" && (
        <div className="flex flex-col flex-grow min-h-0 bg-slate-900/30 border border-white/5 rounded-2xl p-4">
          <div className="flex-grow overflow-y-auto space-y-4 pr-1 pb-4 scrollbar-thin">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-16">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
                  🧠
                </div>
                <p className="text-white font-extrabold text-xl">Knowledge base is ready</p>
                <p className="text-slate-500 text-sm max-w-xs">
                  Ask anything about the documents you ingested. The graph-powered RAG will find the answer.
                </p>
              </div>
            )}

            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.type === "human" ? "justify-end" : "justify-start items-start gap-3"} animate-fade-in`}
              >
                {m.type === "ai" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-sm shrink-0 mt-0.5">
                    🧠
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                    m.type === "human"
                      ? "bg-gradient-to-br from-indigo-600/80 to-purple-700/80 border border-indigo-500/30 rounded-tr-sm text-white shadow-lg"
                      : "bg-slate-900/60 border border-white/8 rounded-tl-sm text-slate-300"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: m.type === "human" ? escHtml(m.content) : renderMarkdown(m.content),
                  }}
                />
              </div>
            ))}

            {waiting && (
              <div className="flex justify-start items-center gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-sm shrink-0">
                  🧠
                </div>
                <div className="bg-slate-900/60 border border-white/8 rounded-2xl rounded-tl-sm px-5 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="border-t border-white/5 pt-3">
            <div className="flex items-end gap-3 bg-slate-900/60 border border-white/8 rounded-2xl px-4 py-3">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask your knowledge base..."
                className="flex-1 bg-transparent text-slate-100 text-sm placeholder-slate-600 outline-none leading-relaxed resize-none min-h-[24px] max-h-36 overflow-y-auto"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || waiting}
                className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel 2: View Ingested Docs */}
      {activeTab === "docs" && (
        <div className="flex flex-col flex-grow min-h-0 bg-slate-900/30 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search document content or metadata..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            <button
              onClick={loadDocuments}
              disabled={docsLoading}
              className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold hover:bg-indigo-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${docsLoading ? "animate-spin" : ""}`} />
              Reload
            </button>
            <span className="text-xs text-slate-600 font-semibold hidden sm:inline-block">
              {filteredDocs.length} chunks
            </span>
          </div>

          <div className="flex-grow overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {docsLoading && (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-sm">Loading ingested documents...</p>
                </div>
              </div>
            )}

            {!docsLoading && filteredDocs.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No documents found.
              </div>
            )}

            {!docsLoading &&
              filteredDocs.map((doc, idx) => {
                const meta = doc.metadata || {};
                const content = doc.page_content || doc.content || "";
                const source = meta.source || meta.file_name || `Document ${idx + 1}`;
                const page = meta.page !== undefined ? `p.${meta.page + 1}` : "";
                const types = String(meta.types || meta.type || meta.content_type || "text");

                const hasImage =
                  meta.has_images === true ||
                  meta.has_images === "true" ||
                  !!(meta.images && String(meta.images).length > 50) ||
                  types.includes("image");
                const hasTable =
                  !!(meta.tables && String(meta.tables).trim().length > 0) || types.includes("table");

                const imgSrc = buildImgSrc(meta.images || meta.image_path || "");

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDoc({ doc, idx })}
                    className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-all cursor-pointer group animate-fade-in"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{hasImage ? "🖼️" : hasTable ? "📊" : "📄"}</span>
                        <div className="min-w-0">
                          <p className="text-white font-bold text-sm truncate">{source}</p>
                          <p className="text-slate-600 text-xs">
                            {page} {types ? `· ${types}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                        {hasTable && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-semibold">
                            TABLE
                          </span>
                        )}
                        {hasImage && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-semibold">
                            IMAGE
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                          CHUNK {idx + 1}
                        </span>
                      </div>
                    </div>

                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt="chunk preview"
                        className="w-full max-h-40 object-contain rounded-xl border border-white/8 mb-3 bg-slate-950/40"
                      />
                    )}

                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 font-mono">
                      {content.slice(0, 280)}
                      {content.length > 280 ? "..." : ""}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(meta)
                          .filter(([k]) => !["images", "tables", "image_path"].includes(k))
                          .slice(0, 3)
                          .map(([k, v]) => (
                            <span
                              key={k}
                              className="text-[10px] text-slate-500 bg-slate-950 border border-white/5 px-2 py-0.5 rounded font-mono"
                            >
                              <strong className="text-slate-600">{k}:</strong> {String(v).slice(0, 25)}
                            </span>
                          ))}
                      </div>
                      <span className="text-indigo-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity ml-3 shrink-0">
                        View full →
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Doc Detail Modal */}
      {selectedDoc && (
        <div
          onClick={() => setSelectedDoc(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
              <h3 className="text-white font-extrabold text-base truncate max-w-[80%]">
                {selectedDoc.doc.metadata?.source || selectedDoc.doc.metadata?.file_name || "Document"}{" "}
                — Chunk {selectedDoc.idx + 1}
              </h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-500 hover:text-white transition text-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6 text-sm text-slate-300 scrollbar-thin">
              {/* Metadata details */}
              {Object.keys(selectedDoc.doc.metadata || {}).filter(
                (k) => !["images", "tables", "image_path"].includes(k)
              ).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Metadata</p>
                  <div className="overflow-x-auto border border-white/5 rounded-xl">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-800/60 text-slate-400 font-semibold border-b border-white/5">
                          <th className="text-left px-3 py-2 w-1/3">Key</th>
                          <th className="text-left px-3 py-2">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selectedDoc.doc.metadata || {})
                          .filter(([k]) => !["images", "tables", "image_path"].includes(k))
                          .map(([k, v]) => (
                            <tr key={k} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                              <td className="px-3 py-2 text-slate-500 font-mono">{k}</td>
                              <td className="px-3 py-2 text-slate-300 font-mono break-all">{String(v)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Embedded Images */}
              {buildImgSrc(selectedDoc.doc.metadata?.images || selectedDoc.doc.metadata?.image_path) && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">🖼️ Embedded Image</p>
                  <img
                    src={buildImgSrc(selectedDoc.doc.metadata?.images || selectedDoc.doc.metadata?.image_path)}
                    alt="Embedded"
                    className="rounded-xl border border-white/8 max-h-80 w-full object-contain bg-slate-950/40"
                  />
                </div>
              )}

              {/* Embedded Tables */}
              {selectedDoc.doc.metadata?.tables && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">📊 Embedded Table</p>
                  <div
                    className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/40 p-3"
                    dangerouslySetInnerHTML={{ __html: renderTableValue(selectedDoc.doc.metadata.tables) }}
                  />
                </div>
              )}

              {/* Raw document text content */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Content</p>
                <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 text-slate-300 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {selectedDoc.doc.page_content || selectedDoc.doc.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
