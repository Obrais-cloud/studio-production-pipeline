"use client";

import { useState, useRef, useEffect } from "react";
import { api, type ChatResponse } from "@/lib/api";

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "¡Hola! Soy tu asistente de producción. Pregúntame sobre guiones, rodaje, edición, presupuesto o deadlines." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const data: ChatResponse = await api.chat(text);
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Error de conexión con el asistente. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-lg transition hover:scale-105"
        aria-label="Chat"
      >
        💬
      </button>
      {open && (
        <div className="fixed bottom-20 right-6 z-50 flex h-[28rem] w-80 flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <span className="text-sm font-semibold text-white">Asistente de Producción</span>
            <button onClick={() => setOpen(false)} className="text-[var(--color-muted)] hover:text-white">✕</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] rounded-lg px-3 py-2"
                  style={{
                    backgroundColor: m.role === "user" ? "var(--color-accent)" : "var(--color-border)",
                    color: "#fff",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-[var(--color-border)] px-3 py-2 text-[var(--color-muted)]">Escribiendo...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--color-border)] p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Pregunta sobre producción..."
              className="flex-1 rounded-lg bg-[var(--color-bg)] px-3 py-2 text-sm text-white outline-none ring-1 ring-[var(--color-border)] focus:ring-[var(--color-accent)]"
            />
            <button onClick={send} className="rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm text-white transition hover:bg-[var(--color-accent-hover)]">
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
