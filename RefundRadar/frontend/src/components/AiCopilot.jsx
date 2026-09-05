import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Trash2, 
  Copy, 
  Check, 
  ShieldAlert, 
  FileText, 
  Link2, 
  Sliders, 
  Building2, 
  Loader2, 
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { API_BASE } from '../config';

export default function AiCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState(() => {
    return [
      {
        role: 'assistant',
        content: `### 👋 Welcome to RefundRadar AI Co-Pilot
I am your **Autonomous Fraud Intelligence & Risk Operations Assistant**.

You can ask me anything about live fraud rings, cluster connections, or policy actions:
- 🚨 **"Why was Cluster C180 flagged as HIGH risk?"**
- 🔗 **"Show me common device links between Account ACC_A_1 and ACC_A_5"**
- ⚖️ **"Draft an official chargeback dispute letter for Order ORD_ACC_N_0_0"**
- 🛡️ **"Simulate what happens if we block device DEV_A_0"**
- 🏘️ **"Why shouldn't university hostel addresses be blocked?"**`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const location = useLocation();

  // Extract active cluster ID if user is on /clusters/:id
  const clusterMatch = location.pathname.match(/\/clusters\/(.+)/);
  const activeClusterId = clusterMatch ? clusterMatch[1] : null;

  // Fetch dynamic suggestions
  useEffect(() => {
    axios.get(`${API_BASE}/copilot/suggestions`, {
      params: { active_cluster_id: activeClusterId }
    })
    .then(res => {
      if (res.data?.suggestions) {
        setSuggestions(res.data.suggestions);
      }
    })
    .catch(() => {
      setSuggestions([
        activeClusterId ? `Why was Cluster ${activeClusterId} flagged as HIGH risk?` : "Why was Cluster C180 flagged as HIGH risk?",
        "Show me common link between Account ACC_A_1 and ACC_A_5",
        "Draft an official chargeback dispute letter for Order ORD_ACC_N_0_0",
        "Simulate what happens if we block device DEV_A_0"
      ]);
    });
  }, [activeClusterId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setLoading(true);

    try {
      // Build history payload for multi-turn conversational context
      const historyPayload = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await axios.post(`${API_BASE}/copilot/chat`, {
        message: text,
        history: historyPayload,
        context: {
          active_cluster_id: activeClusterId,
          pathname: location.pathname
        }
      });

      const replyContent = res.data?.response || "I couldn't process that query. Please try again.";
      const aiMsg = {
        role: 'assistant',
        content: replyContent,
        source: res.data?.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Error communicating with AI engine**: ${err.message || 'Server connection failed'}. Please verify backend API status.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `### 🧹 Chat History Cleared\nAsk me anything about active clusters, chargeback disputes, or entity graphs!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {activeClusterId && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/90 text-white text-xs font-semibold shadow-lg backdrop-blur-md animate-bounce">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Co-Pilot about {activeClusterId}</span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
            title="Open AI Fraud Investigator Co-Pilot"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
            <Bot className="w-5 h-5 text-white transition-transform group-hover:rotate-12" />
            <span className="font-semibold text-sm tracking-wide">AI Co-Pilot</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/20 text-blue-100">
              Gemini
            </span>
          </button>
        </div>
      )}

      {/* Floating / Docked Chat Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-out flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800/80 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl ${
            isExpanded
              ? 'inset-4 sm:inset-8 rounded-2xl'
              : 'bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[480px] md:w-[520px] h-[92vh] sm:h-[660px] sm:rounded-2xl rounded-t-2xl'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Fraud Investigator Co-Pilot
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live AI
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <span>Gemini 2.0 Risk Intelligence</span>
                  {activeClusterId && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">
                      🎯 Cluster: {activeClusterId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1 text-gray-400">
              <button
                onClick={handleClearChat}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors hidden sm:block"
                title={isExpanded ? "Collapse" : "Expand Full View"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title="Close Co-Pilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scroll-smooth">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-2 px-1 text-[11px] text-gray-400 font-medium">
                    <span>{isUser ? 'Fraud Analyst' : 'RefundRadar AI'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    {msg.source && (
                      <span className="text-[10px] text-blue-500 uppercase tracking-wider font-semibold">
                        ({msg.source === 'gemini' ? 'Gemini 2.0' : 'Reasoning Engine'})
                      </span>
                    )}
                  </div>

                  <div
                    className={`relative group max-w-[92%] sm:max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-gray-100 dark:bg-slate-800/80 text-gray-900 dark:text-gray-100 border border-gray-200/80 dark:border-slate-700/60 rounded-tl-none'
                    }`}
                  >
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-white/80 dark:bg-slate-700 text-gray-600 dark:text-gray-200 hover:text-blue-600 transition-all shadow-sm"
                        title="Copy to Clipboard"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed overflow-x-auto space-y-2">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-3 rounded-xl border border-gray-200 dark:border-slate-700/80 shadow-sm bg-white/70 dark:bg-slate-900/60">
                              <table className="w-full text-left border-collapse text-[11px] sm:text-xs" {...props} />
                            </div>
                          ),
                          thead: ({ node, ...props }) => (
                            <thead className="bg-gray-100/90 dark:bg-slate-800/90 border-b border-gray-200 dark:border-slate-700" {...props} />
                          ),
                          th: ({ node, ...props }) => (
                            <th className="px-3 py-2 font-bold text-gray-800 dark:text-gray-200 tracking-wide" {...props} />
                          ),
                          tbody: ({ node, ...props }) => (
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="px-3 py-2 text-gray-700 dark:text-slate-300 whitespace-normal leading-relaxed align-top" {...props} />
                          ),
                          tr: ({ node, ...props }) => (
                            <tr className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors" {...props} />
                          ),
                          code: ({ node, inline, ...props }) => (
                            <code className="bg-blue-500/10 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono px-1.5 py-0.5 rounded text-[11px] font-medium border border-blue-200/50 dark:border-blue-800/40" {...props} />
                          ),
                          p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed text-gray-700 dark:text-gray-200" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2.5 space-y-1.5 text-gray-700 dark:text-gray-200" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2.5 space-y-1.5 text-gray-700 dark:text-gray-200" {...props} />,
                          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                          h1: ({ node, ...props }) => <h1 className="text-base font-bold text-blue-600 dark:text-blue-400 mt-3 mb-2 flex items-center gap-1.5" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-sm font-bold text-gray-900 dark:text-white mt-3 mb-1.5 border-b border-gray-200 dark:border-slate-700 pb-1" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-2.5 mb-1 flex items-center gap-1" {...props} />,
                          h4: ({ node, ...props }) => <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-2 mb-1 uppercase tracking-wider" {...props} />,
                          blockquote: ({ node, ...props }) => (
                            <div className="p-3 my-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border-l-4 border-blue-500 dark:border-blue-400 text-xs text-blue-950 dark:text-blue-200 shadow-sm leading-relaxed" {...props} />
                          ),
                          hr: ({ node, ...props }) => <hr className="my-3 border-gray-200 dark:border-slate-700/60" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex flex-col items-start space-y-1">
                <div className="flex items-center gap-2 px-1 text-[11px] text-gray-400 font-medium">
                  <span>RefundRadar AI</span>
                  <span>•</span>
                  <span>Thinking...</span>
                </div>
                <div className="bg-gray-100 dark:bg-slate-800/80 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-200/80 dark:border-slate-700/60 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-medium animate-pulse">
                    Synthesizing graph linkages & fraud telemetry...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-slate-900/40">
            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Suggested Inquiries</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar text-xs">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sug)}
                  disabled={loading}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm transition-all text-[11px] font-medium flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>{sug}</span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          {/* Input & Send Area */}
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    activeClusterId
                      ? `Ask about Cluster ${activeClusterId}, devices, or dispute letters...`
                      : "Ask about clusters, devices, chargeback disputes..."
                  }
                  disabled={loading}
                  className="w-full bg-gray-100 dark:bg-slate-800/90 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-transparent dark:border-slate-700/60 placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium shadow-md shadow-blue-500/20 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                title="Send Message (Enter)"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-1.5">
              Powered by Razorpay AI Risk Intelligence & Gemini 2.0
            </div>
          </div>
        </div>
      )}
    </>
  );
}
