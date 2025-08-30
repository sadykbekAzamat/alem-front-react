import React, { useState } from "react";
import { MessageCircle, Info } from "lucide-react";

export default function TutorLessonsArchive({
  rows = [
    {
      id: "1",
      student: {
        name: "Mukhit Y.",
        avatarUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=facearea&facepad=2&h=200",
      },
      paid: 1,
      remaining: 0,
      comment: "-",
    },
  ],
}) {
  const [openRow, setOpenRow] = useState(null);

  return (
    <div className="w-full px-6">
      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Header */}
        <div className="grid grid-cols-[minmax(180px,1fr)_120px_180px_1fr_44px] rounded-2xl items-center gap-4 px-4 py-3 bg-gray-50 text-sm text-gray-600 font-medium">
          <div>Ученик</div>
          <div className="text-center">Оплачено</div>
          <div className="text-center">Оставшиеся уроки</div>
          <div className="text-left">Комментарий</div>
          <div />
        </div>

        {/* Rows */}
        <ul className="divide-y divide-gray-200">
          {rows.map((r) => (
            <li
              key={r.id}
              className="relative grid grid-cols-[minmax(180px,1fr)_120px_180px_1fr_44px] items-center gap-4 px-4 py-3"
            >
              {/* Student */}
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={r.student.avatarUrl}
                  alt={r.student.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="truncate text-sm text-gray-900">
                  {r.student.name}
                </span>
              </div>

              {/* Paid */}
              <div className="text-center text-sm font-semibold text-gray-900">
                {r.paid}
              </div>

              {/* Remaining */}
              <div className="text-center text-sm font-semibold text-gray-900">
                {r.remaining}
              </div>

              {/* Comment */}
              <div className="text-sm text-gray-500 truncate">
                {r.comment || "-"}
              </div>

              {/* Kebab */}
              <div className="flex justify-end relative">
                <button
                  type="button"
                  aria-label="Действия"
                  onClick={() => setOpenRow(openRow === r.id ? null : r.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 active:bg-gray-100 text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <circle cx="5" cy="12" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="19" cy="12" r="1.5" />
                  </svg>
                </button>

                {/* Floating menu */}
                {openRow === r.id && (
                  <div className="absolute right-0 top-10 z-10 w-40 rounded-xl bg-white shadow-lg border border-gray-100 py-1 animate-fadeIn">
                    <button className="w-full font-muller font-regular flex items-center gap-2 px-3 py-2 text-xs text-gray-800 hover:bg-gray-50">
                      <MessageCircle className="h-3 w-3" /> Написать
                    </button>
                    <button className="w-full font-muller font-regular flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50">
                      <Info className="h-3 w-3" /> Пожаловаться
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}

          {rows.length === 0 && (
            <li className="px-4 py-6 text-sm text-gray-500">Нет данных</li>
          )}
        </ul>
      </div>
    </div>
  );
}
