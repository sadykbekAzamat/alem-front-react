// src/components/Header.js
import { Bell, MessageCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-3 shadow-sm bg-white z-50">
      {/* Left side */}
      <div className="text-3xl font-muller font-bold text-white">Alem</div>

      {/* Right side icons */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          className="relative text-white"
          aria-label="Уведомления"
        >
          <Bell className="h-5 w-5" />
          {/* Пример бейджа количества */}
          {/* <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span> */}
        </button>

        <button
          type="button"
          className="text-white "
          aria-label="Чат"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
