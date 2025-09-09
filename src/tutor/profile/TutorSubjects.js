import { useEffect, useMemo, useState } from "react";
import api from "../../utils/apiClient";
import { GraduationCap, MoreVertical } from "lucide-react";

export default function TutorSubjects() {
  const API = process.env.REACT_APP_API;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tutor, setTutor] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError("");
        // 1) Получаем текущего пользователя
        const r1 = await api.get(`${API}/api/v1/auth/me`);
        if (!r1.ok) throw new Error(`auth/me ${r1.status}`);
        const j1 = await r1.json();
        const me = j1?.user || j1?.data?.user || j1?.data || {};
        if (!me?.id) throw new Error("Нет user id");

        // 2) Загружаем карточку репетитора
        const r2 = await api.get(`${API}/api/v1/tutors/${me.id}`);
        if (!r2.ok) throw new Error(`tutors/:id ${r2.status}`);
        const t = await r2.json();
        if (!alive) return;
        setTutor(t);
      } catch (e) {
        console.error(e);
        if (alive) setError("Не удалось загрузить предметы. Обновите страницу.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [API]);

  const groups = useMemo(() => {
    const list = Array.isArray(tutor?.sections) ? tutor.sections : [];
    // Группируем по sectionId
    const map = new Map();
    for (const item of list) {
      const key = item.sectionId || item.sectionSlug || "section";
      if (!map.has(key)) {
        map.set(key, {
          sectionId: item.sectionId,
          sectionName: item.sectionName || "Раздел",
          items: [],
        });
      }
      map.get(key).items.push(item);
    }
    return Array.from(map.values());
  }, [tutor]);

  if (loading) return <div className="px-6 py-6 text-gray-600">Загрузка…</div>;
  if (error) return <div className="px-6 py-6 text-red-600">{error}</div>;

  if (!groups.length) {
    return (
      <div className="px-6 py-6">
        <h1 className="text-xl font-muller font-bold mb-3">Мои предметы</h1>
        <div className="rounded-2xl border border-gray-200 p-5 max-w-md bg-white">
          <div className="text-sm text-gray-600">
            У вас пока не добавлено ни одного предмета. Заполните анкету в разделе
            <span className="font-medium"> «Анкетирование»</span>, чтобы указать дисциплины и цены.
          </div>
        </div>
      </div>
    );
  }

  const years = Number.isFinite(tutor?.yearsExperience)
    ? tutor.yearsExperience
    : null;

  return (
    <div className="px-6 py-6">
      <h1 className="text-xl font-muller font-bold mb-4">Мои предметы</h1>

      <div className="grid gap-4 max-w-md">
        {groups.map((g) => (
          <SubjectCard
            key={g.sectionId}
            title={g.sectionName}
            count={g.items.length}
            years={years}
            items={g.items}
          />
        ))}
      </div>
    </div>
  );
}

/* ----------------- Card ----------------- */
function SubjectCard({ title, count, years, items }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 grid place-items-center rounded-xl bg-purple-100 text-purple-700">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-muller font-semibold text-gray-900">
              {title}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              Подразделов: <span className="font-medium">{count}</span>
              {typeof years === "number" && (
                <>
                  <span className="mx-2">•</span>
                  Стаж: <span className="font-medium">{years}</span> {pluralYears(years)}
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 p-1"
          aria-label="Действия"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Items */}
      <div className="mt-3 space-y-3">
        {items.map((it, i) => (
          <div
            key={`${it.subsectionId}-${i}`}
            className="rounded-2xl bg-purple-50 p-4"
          >
            <div className="text-sm font-muller font-semibold text-gray-900">
              {it.subsectionName}
            </div>
            <div className="mt-2 text-xs text-gray-600">Цена занятия:</div>
            <div className="mt-1 inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-purple-700">
              {formatKZT(it.hourlyRateMinor, it.currency)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------- utils ----------------- */
function formatKZT(minor, currency = "KZT") {
  const amount = Math.round(Number(minor || 0) / 100); // minor → KZT
  const s = amount.toLocaleString("ru-RU");
  const symbol = currency === "KZT" ? "₸" : currency;
  return `${s} ${symbol}`;
}

function pluralYears(n) {
  // 1 год, 2-4 года, 5+ лет
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return "лет";
  if (b > 1 && b < 5) return "года";
  if (b === 1) return "год";
  return "лет";
}
