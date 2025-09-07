import React, { useMemo, useState } from "react";
import { Search, MoreVertical, Paperclip, Send, Plus } from "lucide-react";

/**
 * Messages
 * Left: chats list with search + tabs. Right: either selected chat thread or empty state.
 * TailwindCSS styling; demo data included. No network.
 */
export default function Messages() {
  // Demo data ---------------------------------------------------------------
  const initialChats = useMemo(
    () => [
      {
        id: "mukhit",
        name: "Mukhit Y",
        avatar:
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=128&h=128&fit=crop",
        lastMessage: "30000 тенге айына, 12 сабақ, аптасына 3 рет",
        lastTime: "05:59 PM",
        messages: [
          { id: 1, at: "2025-08-21T15:39:00Z", text: "Салем", who: "them" },
          { id: 2, at: "2025-08-21T15:40:00Z", text: "Сабакка жазылайын деп едым", who: "them" },
          { id: 3, at: "2025-08-21T15:41:00Z", text: "Багасы канацадан?", who: "them" },
          { id: 4, at: "2025-08-30T15:40:00Z", text: "Салам брат", who: "me" },
          {
            id: 5,
            at: "2025-08-30T17:59:00Z",
            text: "30000 тенге айына, 12 сабақ, аптасына 3 рет",
            who: "me",
          },
        ],
        lastSeen: "Был(а) 8/26/2025 в 04:49 PM",
      },
      {
        id: "aisha",
        name: "Айша",
        avatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=128&h=128&fit=crop",
        lastMessage: "Здравствуйте",
        lastTime: "06:24 PM",
        messages: [{ id: 6, at: "2025-08-30T16:24:00Z", text: "Здравствуйте", who: "them" }],
        lastSeen: "Онлайн",
      },
    ],
    []
  );

  // State ------------------------------------------------------------------
  const [tab, setTab] = useState("active");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialChats[0]?.id ?? null);
  const selectedChat = initialChats.find((c) => c.id === selectedId) || null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialChats.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q)
    );
  }, [query, initialChats]);

  // Render -----------------------------------------------------------------
  return (
    <div className="grid h-[90vh] grid-cols-[320px_1fr] overflow-hidden border border-gray-200 bg-white">
      {/* Left column: chats list */}
      <aside className="flex h-full flex-col border-r border-gray-200">
        <div className="p-4">
          <h2 className="text-xl font-muller font-bold text-gray-900">Сообщения</h2>
          <div className="mt-3 relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск"
              className="w-full rounded-xl bg-gray-100 pl-10 pr-3 py-2 text-sm font-muller focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Tabs */}
          <div className="mt- hidden flex gap-3">
            <button
              onClick={() => setTab("active")}
              className={`rounded-full px-4 py-2 text-sm font-muller ${
                tab === "active" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Активные чаты
            </button>
            <button
              onClick={() => setTab("arch")}
              className={`rounded-full px-4 py-2 text-sm font-muller ${
                tab === "arch" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Архивные чаты
            </button>
          </div>
        </div>

        {/* List */}
        <div className="min-h-0 flex-1 overflow-y-auto px-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-blue-50 ${
                selectedId === c.id ? "bg-blue-50" : ""
              }`}
            >
              <img src={c.avatar} alt={c.name} className="h-9 w-9 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="truncate font-muller font-semibold text-gray-900">{c.name}</div>
                  <div className="ml-3 shrink-0 text-xs text-gray-400">{c.lastTime}</div>
                </div>
                <div className="truncate text-sm text-gray-500">{c.lastMessage}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Right column: either chat or empty */}
      <main className="relative h-full">
        {!selectedChat ? (
          <EmptyState />
        ) : (
          <ChatThread key={selectedChat.id} chat={selectedChat} />
        )}
      </main>
    </div>
  );
}

/** Right pane: empty state */
function EmptyState() {
  return (
    <div className="grid h-full place-items-center">
      <div className="text-center">
        <h3 className="mb-2 text-2xl font-muller font-extrabold text-gray-900">Начните новый диалог</h3>
        <p className="mx-auto mb-6 max-w-md text-gray-500">
          Сообщения, отправленные после подключения с учеником/наставником, появятся здесь
        </p>
        <button className="rounded-full bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 font-muller">
          Перейти к выбору репетитора
        </button>
      </div>
    </div>
  );
}

/** Right pane: selected chat thread */
function ChatThread({ chat }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // group messages by day labels similar to screenshot
  const groups = useMemo(() => {
    const byDay = new Map();
    for (const m of chat.messages) {
      const d = new Date(m.at);
      const key = d.toDateString();
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(m);
    }
    return Array.from(byDay.entries())
      .map(([key, msgs]) => ({ label: dayLabel(new Date(msgs[0].at)), msgs }))
      .sort((a, b) => new Date(a.msgs[0].at) - new Date(b.msgs[0].at));
  }, [chat.messages]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
        <img src={chat.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
        <div className="flex-1">
          <div className="font-muller font-semibold text-gray-900">{chat.name}</div>
          <div className="text-xs text-gray-400">{chat.lastSeen}</div>
        </div>
        <div className="relative">
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 z-10 w-44 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
              <button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50">Удалить чат</button>
              <button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50">В архив</button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
        {groups.map((g) => (
          <section key={g.label}>
            <div className="mb-3 flex justify-center">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                {g.label}
              </span>
            </div>
            <div className="space-y-3">
              {g.msgs.map((m) => (
                <MessageBubble key={m.id} who={m.who} at={m.at} text={m.text} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Composer */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="rounded-2xl bg-gray-50 p-3">
          <textarea
            rows={2}
            placeholder="Напишите сообщение"
            className="w-full resize-none bg-transparent font-muller text-gray-900 outline-none placeholder:text-gray-400"
          />
          <div className="mt-2 flex items-center justify-between">
            <button className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">
              <Plus className="h-4 w-4" />
              Добавить
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ who, at, text }) {
  const isMe = who === "me";
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
          isMe ? "bg-blue-900 text-white rounded-tr-md" : "bg-indigo-50 text-gray-900"
        }`}
      >
        <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
        <div className={`mt-1 text-[11px] ${isMe ? "text-indigo-200" : "text-gray-400"}`}>
          {new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(
            new Date(at)
          )}
        </div>
      </div>
    </div>
  );
}

function dayLabel(date) {
  const today = new Date();
  const d0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dX = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (dX - d0) / 86400000;
  if (diff === 0) return "Сегодня";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" })
    .format(date)
    .replace(/^./, (c) => c.toUpperCase());
}
