import React, { useState } from "react";
import { CloudOff, Loader2, CheckCircle2, XCircle, Link2 } from "lucide-react";

/**
 * TutorCalendarGoogle (self-contained)
 * - Disconnect shows confirm → then a blue "Подключить Google Calendar" button.
 * - Connect runs a built-in handler you can replace with a real fetch().
 */
export default function TutorCalendarGoogle() {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(true);
  const [status, setStatus] = useState(null); // {type: 'success' | 'error', msg}

  const handlePrimaryClick = () => {
    if (!connected || loading) return;
    setOpenConfirm(true); // confirm only for disconnect
  };

  async function disconnectGoogle() {
    try {
      setLoading(true);
      setStatus(null);
      // TODO: replace with real API call
      // const res = await fetch('/api/integrations/google-calendar/disconnect', { method: 'POST' });
      // if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await new Promise((r) => setTimeout(r, 700));
      setConnected(false);
      setStatus({ type: "success", msg: "Google Calendar отвязан." });
    } catch {
      setStatus({ type: "error", msg: "Не удалось отвязать. Попробуйте позже." });
    } finally {
      setLoading(false);
      setOpenConfirm(false);
    }
  }

  async function connectGoogle() {
    try {
      setLoading(true);
      setStatus(null);
      // TODO: replace with real API call / OAuth start
      // const res = await fetch('/api/integrations/google-calendar/connect', { method: 'POST' });
      await new Promise((r) => setTimeout(r, 700));
      setConnected(true);
      setStatus({ type: "success", msg: "Google Calendar подключен." });
    } catch {
      setStatus({ type: "error", msg: "Не удалось подключить. Попробуйте позже." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl px-6">
      <p className="text-gray-600 font-muller text-sm mb-4">
        При отключении календаря, все ваше расписание сбросится
      </p>

      <div className="relative inline-flex">
        {connected ? (
          // Disconnect (outlined red) — with confirm popover
          <button
            type="button"
            onClick={handlePrimaryClick}
            disabled={loading}
            className={[
              "inline-flex items-center gap-3 rounded-full border-2 px-5 py-2",
              "font-muller font-medium",
              "border-red-300 text-sm text-red-600 hover:bg-red-50",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            ].join(" ")}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CloudOff className="h-5 w-5" />}
            <span>Отвязать Google Calendar</span>
          </button>
        ) : (
          // Connect (outlined blue)
          <button
            type="button"
            onClick={connectGoogle}
            disabled={loading}
            className={[
              "inline-flex items-center gap-3 rounded-full border-2 px-5 py-2",
              "font-muller font-medium",
              "border-blue-300 text-sm text-blue-700 hover:bg-blue-50",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            ].join(" ")}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Link2 className="h-5 w-5" />}
            <span>Подключить Google Calendar</span>
          </button>
        )}

        {/* Confirmation popover (only shown when connected) */}
        {connected && openConfirm && (
          <div className="absolute left-0 top-[110%] z-10 w-[420px] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
            <p className="text-sm text-gray-700 font-muller mb-3">
              Вы уверены? Отключение Google Calendar сбросит текущее расписание.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpenConfirm(false)}
                className="rounded-full border px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={disconnectGoogle}
                className="rounded-full bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Подтвердить
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status line */}
      {status && (
        <div className="mt-4 hidden inline-flex items-center gap-2 text-sm font-muller">
          {status.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className={status.type === "success" ? "text-green-700" : "text-red-700"}>
            {status.msg}
          </span>
        </div>
      )}
    </div>
  );
}
