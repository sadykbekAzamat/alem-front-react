import React, { useMemo, useState } from "react";
import { Trash2, Plus } from "lucide-react";


export default function TutorCalendarTimetable() {
  const [state, setState] = useState(() => buildDefault());

  const setDay = (key, patch) => {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const addSlot = (key) => {
    setState((prev) => {
      const day = prev[key];
      const last = day.slots[day.slots.length - 1];
      const newStart = last ? last.start : "09:00";
      const newEnd = last ? last.end : "17:00";
      return {
        ...prev,
        [key]: { ...day, slots: [...day.slots, { start: newStart, end: newEnd }] },
      };
    });
  };

  const removeSlot = (key, idx) => {
    setState((prev) => {
      const day = prev[key];
      const nextSlots = day.slots.filter((_, i) => i !== idx);
      return {
        ...prev,
        [key]: {
          ...day,
          slots: nextSlots.length ? nextSlots : [{ start: "09:00", end: "17:00" }],
        },
      };
    });
  };

  const invalid = useMemo(() => {
    return DAYS.some(({ key }) =>
      state[key].enabled && state[key].slots.some((s) => toMin(s.start) >= toMin(s.end))
    );
  }, [state]);

  const handleSave = () => {
    if (invalid) return;
    console.log("Saved schedule:", state);
  };

  return (
    <div className="w-full px-6">
      <h2 className="mb-4 text-sm font-muller font-medium text-gray-700">Расписание</h2>

      <div className="space-y-4">
        {DAYS.map(({ key, label }) => {
          const day = state[key];
          return (
            <div key={key} className="grid grid-cols-[52px_200px_1fr] items-start gap-4">
              <Toggle checked={day.enabled} onChange={(v) => setDay(key, { enabled: v })} />

              <div className="w-40 text-gray-900 font-muller font-medium text-sm leading-9">
                {label}
              </div>

              <div className="flex flex-col gap-3">
                {day.slots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex font-muller font-medium text-sm items-center gap-3">
                      <TimeSelect
                        value={slot.start}
                        disabled={!day.enabled}
                        onChange={(val) => {
                          const slots = day.slots.map((s, i) => (i === idx ? { ...s, start: val } : s));
                          setDay(key, { slots });
                        }}
                      />
                      <span className="text-gray-500">до</span>
                      <TimeSelect
                        value={slot.end}
                        disabled={!day.enabled}
                        onChange={(val) => {
                          const slots = day.slots.map((s, i) => (i === idx ? { ...s, end: val } : s));
                          setDay(key, { slots });
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={!day.enabled}
                        onClick={() => removeSlot(key, idx)}
                        className={classNames(
                          "inline-flex h-9 w-9 items-center justify-center text-gray-600",
                          "hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        aria-label="Удалить интервал"
                        title="Удалить интервал"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      {idx === 0 && (
                        <button
                          type="button"
                          disabled={!day.enabled}
                          onClick={() => addSlot(key)}
                          className={classNames(
                            "inline-flex h-9 w-9 items-center justify-center text-gray-600",
                            "hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                          aria-label="Добавить интервал"
                          title="Добавить интервал"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <button
          type="button"
          disabled={invalid}
          onClick={handleSave}
          className={classNames(
            "w-48 rounded-full px-4 py-3 text-white font-muller font-medium",
            invalid ? "bg-blue-300" : "bg-indigo-500 hover:bg-indigo-600"
          )}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}

/** ------------------------- Helpers & constants ------------------------- */
const DAYS = [
  { key: "mon", label: "Понедельник" },
  { key: "tue", label: "Вторник" },
  { key: "wed", label: "Среда" },
  { key: "thu", label: "Четверг" },
  { key: "fri", label: "Пятница" },
  { key: "sat", label: "Суббота" },
  { key: "sun", label: "Воскресенье" },
];

const defaultDay = () => ({ enabled: true, slots: [{ start: "09:00", end: "17:00" }] });

const buildDefault = () =>
  DAYS.reduce((acc, d) => {
    acc[d.key] = defaultDay();
    return acc;
  }, {});

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

function TimeSelect({ value, onChange, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={classNames(
          "appearance-none rounded-full bg-white px-4 py-2 pr-8 text-sm text-gray-900",
          "border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        {TIME_OPTIONS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 111.06 1.06l-4.24 3.36a.75.75 0 01-.94 0L5.21 8.29a.75.75 0 01.02-1.08z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={classNames(
        "relative inline-flex h-6 w-10 items-center rounded-full transition-colors",
        checked ? "bg-blue-600" : "bg-gray-300"
      )}
      aria-pressed={checked}
    >
      <span
        className={classNames(
          "inline-block h-4 w-4 transform rounded-full bg-white transition",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
}

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
