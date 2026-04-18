import { useState, useRef, useEffect } from 'react';

const SUGGESTIONS = [
  'Why isn\'t Harvard in my results?',
  'Which school gives me the best merit scholarship chance?',
  'Should I apply Early Decision to any of these?',
  'Explain how you classified my reach schools',
  'What\'s my best safety school?',
];

export default function ChatBot({ userProfile, schools }) {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  async function send(text) {
    const userText = text ?? input.trim();
    if (!userText || loading) return;

    const userMsg = { role: 'user', content: userText };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    // Append empty assistant turn — we'll stream into it
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          userProfile,
          schools,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Server error' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.error) throw new Error(data.error);
            if (data.text) {
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = { ...last, content: last.content + data.text };
                return updated;
              });
            }
          } catch (e) {
            if (e.message !== 'Unexpected end of JSON input') console.error('SSE parse error:', e);
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `Sorry, I ran into an error: ${err.message}. Please try again.`,
          error: true,
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg font-semibold text-sm transition-all ${
          open ? 'bg-slate-700 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
        aria-label="Toggle AI advisor chat"
      >
        <span className="text-lg">{open ? '✕' : '💬'}</span>
        {!open && <span>Ask AI Advisor</span>}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-0 sm:right-6 z-50 w-full sm:w-[26rem] flex flex-col rounded-none sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 overflow-hidden bg-white"
             style={{ height: '70vh', maxHeight: '520px' }}>

          {/* Header */}
          <div className="bg-indigo-600 px-4 py-3 flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <div className="flex-1">
              <p className="text-white font-bold text-sm leading-none">AI College Advisor</p>
              <p className="text-indigo-200 text-xs mt-0.5">Ask why schools appeared, strategies, probabilities</p>
            </div>
          </div>

          {/* Message area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
            {isEmpty && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 text-center pt-4">
                  Hi! I have full context on your profile and all {schools.length} schools. Ask me anything.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <span className="text-lg mr-1.5 mt-0.5 flex-shrink-0">🎓</span>
                )}
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : msg.error
                    ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.content}
                  {msg.role === 'assistant' && !msg.content && loading && (
                    <span className="inline-flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-slate-200 px-3 py-2.5 bg-white flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about schools, chances, strategy…"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 max-h-24 overflow-y-auto leading-relaxed"
              style={{ minHeight: '38px' }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Send"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
