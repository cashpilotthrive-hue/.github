import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../../api/client";
import type { ChatResponse } from "../../api/types";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello! Ask about your balance, or say things like 'buy $500 of BTC'.",
    },
  ]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("principal_api_key") ?? ""
  );
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const res: ChatResponse = await sendChatMessage(text, apiKey);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Error communicating with server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") void handleSend();
  };

  return (
    <div className="rounded-xl bg-slate-800 flex flex-col h-full min-h-[400px]">
      {/* API key input */}
      <div className="px-4 pt-4">
        <input
          type="password"
          placeholder="API key (x-api-key)"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            localStorage.setItem("principal_api_key", e.target.value);
          }}
          className="w-full rounded bg-slate-700 text-slate-200 text-xs px-3 py-1.5 outline-none placeholder-slate-500 border border-slate-600 focus:border-slate-400"
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
              msg.role === "user"
                ? "self-end bg-indigo-600 text-white"
                : "self-start bg-slate-700 text-slate-100"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="self-start bg-slate-700 text-slate-400 text-sm rounded-lg px-4 py-2">
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-4 border-t border-slate-700">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command or question…"
          className="flex-1 rounded-lg bg-slate-700 text-slate-100 text-sm px-4 py-2 outline-none placeholder-slate-500 border border-slate-600 focus:border-indigo-500"
          disabled={loading}
        />
        <button
          onClick={() => void handleSend()}
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
