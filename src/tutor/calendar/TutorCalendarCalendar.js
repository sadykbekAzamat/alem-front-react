import React, { useMemo, useState } from "react";

/**
 * Calendar (week strip + day details)
 * - Shows month title with week navigation
 * - Week days (Mon→Sun). Blue pill marks **today** always
 * - Clicking a day selects it (title below updates); events placeholder
 */
export default function TutorCalendarCalendar() {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(startOfWeek(today)); // Monday-based week start
  const [selected, setSelected] = useState(today);

  const week = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(cursor, i)),
  [cursor]);

  const monthTitle = useMemo(() => {
  const mid = addDays(cursor, 3); // Wed of the current week
  return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" })
    .format(mid)
    .replace(/^./, c => c.toUpperCase());
}, [cursor]);

  function prevWeek() {
  setCursor(c => addDays(c, -7));
  setSelected(s => addDays(s, -7));
}
function nextWeek() {
  setCursor(c => addDays(c, 7));
  setSelected(s => addDays(s, 7));
}


  return (
    <div className="w-full px-6 py-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-muller font-bold text-gray-900 flex-1">{monthTitle}</h2>
        <nav className="flex items-center gap-2">
          <IconBtn aria-label="Предыдущая неделя" onClick={prevWeek}>&lt;</IconBtn>
          <IconBtn aria-label="Следующая неделя" onClick={nextWeek}>&gt;</IconBtn>
        </nav>
      </div>

      {/* Week header */}
      <div className="mt-4 grid grid-cols-7 max-w-xl text-center text-xs font-muller text-gray-500 tracking-wide">
        {WEEKDAYS_RU.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Week days */}
      <div className="mt-1 grid grid-cols-7 max-w-xl text-center">
        {week.map((d) => {
          const isToday = sameDate(d, today);
          const isSelected = sameDate(d, selected);
          return (
            <div key={d.toISOString()} className="py-2">
              <button
                onClick={() => setSelected(d)}
                className={[
                  "inline-flex h-9 min-w-[34px] items-center justify-center rounded-2xl px-2 text-sm font-muller",
                  isToday ? "bg-blue-600 text-white" : isSelected ? "bg-gray-100 text-gray-900" : "text-gray-400",
                ].join(" ")}
              >
                {d.getDate()}
              </button>
            </div>
          );
        })}
      </div>

      {/* Day title */}
      <div className="mt-8">
        <h3 className="text-base font-muller font-semibold text-gray-900">
          {new Intl.DateTimeFormat("ru-RU", { weekday: "long" }).format(selected)
            .replace(/^./, (c) => c.toUpperCase())}
          {`, ${selected.getDate()}`}
        </h3>
      </div>

      {/* Events list (placeholder) */}
      <div className="mt-10">
        <p className="text-center text-gray-500 font-muller text-lg">
          На этот день нет запланированных событий.
        </p>
      </div>
    </div>
  );
}

/*** helpers ***/
const WEEKDAYS_RU = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

function startOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7; // 0..6, Monday=0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function sameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function IconBtn({ children, ...rest }) {
  return (
    <button
      {...rest}
      className="grid h-8 w-8 place-items-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
    >
      <span className="-translate-y-px select-none">{children}</span>
    </button>
  );
}
