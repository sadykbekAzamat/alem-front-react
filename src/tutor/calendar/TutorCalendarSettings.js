import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * CalendarSettings
 * Self-contained settings block with three dropdowns matching the provided mock.
 * - Минимальное время до записи на пробный урок
 * - Минимальное время до записи на обычный урок
 * - Максимальный период записи
 */
export default function TutorCalendarSettings() {
  const [trialLead, setTrialLead] = useState("За 1 час");
  const [regularLead, setRegularLead] = useState("2 часа");
  const [maxWindow, setMaxWindow] = useState("2 месяца");

  return (
    <div className="w-full px-6 max-w-3xl space-y-10">
      <Block
        title="Минимальное время до записи на пробный урок"
        subtitle="Ученики не смогут записаться на пробный урок до заданного времени, чтобы у вас было время подготовиться"
      >
        <label className="mb-2 font-muller font-medium text-sm">Минимальное время до записи на пробный урок</label>
        <Dropdown
          value={trialLead}
          onChange={setTrialLead}
          options={["15 минут", "30 минут", "За 1 час", "За 2 часа"]}
        />
      </Block>

      <Block
        title="Минимальное время до записи на обычный урок"
        subtitle="Ученики не смогут записаться на обычный урок до заданного времени"
      >
        <label className="mb-2 font-muller font-medium text-sm">Минимальное время до записи на пробный урок</label>
        <Dropdown
          value={regularLead}
          onChange={setRegularLead}
          options={["2 часа", "3 часа", "6 часов", "12 часов"]}
        />
      </Block>

      <Block
        title="Максимальный период записи"
        subtitle="Укажите, за сколько времени вперёд ученики могут записаться на ваши уроки"
      >
        <label className="mb-2 font-muller font-medium text-sm">Максимальный период записи</label>
        <Dropdown
          value={maxWindow}
          onChange={setMaxWindow}
          options={["1 неделя", "2 недели", "1 месяц", "2 месяца", "3 месяца"]}
        />
      </Block>
    </div>
  );
}

function Block({ title, subtitle, children }) {
  return (
    <section>
      <h3 className="text-lg font-muller font-medium text-gray-900 mb-2">{title}</h3>
      {subtitle && (
        <p className="text-gray-500 mb-4 text-base leading-snug max-w-2xl">{subtitle}</p>
      )}
      {children}
    </section>
  );
}

function Dropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full max-w-xl rounded-2xl bg-indigo-50/20 px-4 py-3 text-left text-gray-900 shadow-sm border border-indigo-50 hover:bg-indigo-50/30 focus:outline-none"
      >
        <div className="flex items-center justify-between">
          <span className="font-muller text-sm font-medium">{value}</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-full max-w-xl rounded-2xl bg-blue-50 shadow-xl border p-1">
          <ul className="max-h-80 overflow-auto py-1">
            {options.map((opt) => {
              const selected = opt === value;
              return (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2 py-1 text-left text-gray-900 hover:bg-gray-100 ${
                      selected ? "bg-gray-100" : ""
                    }`}
                  >
                    <span className="font-muller text-sm">{opt}</span>
                    {selected && <Check className="h-5 w-5 text-gray-500" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
