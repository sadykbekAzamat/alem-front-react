// Survey.js
import { useEffect, useMemo, useState } from "react";
import upload from "../../assets/img/upload.png";
import plus from "../../assets/img/plus.png";
import down from "../../assets/img/down.svg";

export default function TutorSurvey() {
  const [university, setUniversity] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [subject, setSubject] = useState("");
  const [subsections, setSubsections] = useState([{ name: "", price: "" }]);
  const [experience, setExperience] = useState("");

  // Учебные заведения
  const [institutions, setInstitutions] = useState([]); // [{id, name}]
  const [uniLoading, setUniLoading] = useState(false);
  const [uniError, setUniError] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    const fetchInstitutions = async () => {
      setUniLoading(true);
      setUniError("");
      try {
        const res = await fetch(
          "https://api.repetino.kz/educational-institution?page=1&limit=100",
          { signal: ac.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // ожидается форма { data: [{id, name, ...}, ...] }
        const list = Array.isArray(json?.data)
          ? json.data
              .filter((it) => it?.name)
              .map((it) => ({ id: it.id, name: it.name }))
          : [];
        setInstitutions(list);
      } catch (err) {
        if (err.name !== "AbortError") setUniError("Не удалось загрузить список ВУЗов.");
      } finally {
        setUniLoading(false);
      }
    };
    fetchInstitutions();
    return () => ac.abort();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setCertificates((prev) => [...prev, ...files].slice(0, 6));
  };

  const addSubsection = () =>
    setSubsections((prev) => [...prev, { name: "", price: "" }]);

  const updateSubsection = (idx, key, value) =>
    setSubsections((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
    );

  const uniOptions = useMemo(() => {
    if (uniLoading) return [{ id: "__loading", name: "Загрузка..." }];
    if (uniError) return [{ id: "__error", name: "Ошибка загрузки" }];
    return institutions;
  }, [uniLoading, uniError, institutions]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <main className="w-full max-w-xl mx-auto">
        <h1 className="text-2xl font-muller font-bold text-gray-900 mb-6">
          Уровень владения предметом, который вы преподаете?
        </h1>

        {/* ВУЗ */}
        <label className="block text-sm font-muller text-gray-900">
          Где вы обучались?
        </label>
        <div className="relative mt-1">
          <select
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full appearance-none rounded-xl bg-blue-50 px-3 py-2 pr-9 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            disabled={uniLoading || !!uniError}
          >
            <option value="">Выберите учебное заведение</option>
            {uniOptions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <img
            className="h-5 w-5 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            alt=""
            src={down}
          />
        </div>
        {uniError && (
          <div className="mt-1 text-xs text-red-600">
            {uniError} Попробуйте обновить страницу.
          </div>
        )}

        {/* Сертификаты */}
        <div className="mt-6">
          <label className="block text-sm font-muller text-gray-900 mb-2">
            Загрузите сертификаты
          </label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="certUpload"
          />
          <label
            htmlFor="certUpload"
            className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 hover:bg-gray-100"
          >
            <img src={upload} alt="upload" className="w-6 h-6" />
            <span className="text-sm text-gray-700">
              Вы можете загрузить до 6 сертификатов. Максимальный размер 20МБ
            </span>
          </label>

          <ul className="mt-3 text-sm text-gray-600">
            {certificates.map((file, idx) => (
              <li key={idx}>• {file.name}</li>
            ))}
          </ul>
        </div>

        {/* Предмет */}
        <div className="mt-8">
          <label className="block text-sm font-muller text-gray-900">
            Какой предмет вы преподаете?
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full rounded-xl bg-blue-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите предмет</option>
            <option value="math">Математика</option>
            <option value="physics">Физика</option>
            <option value="english">Английский</option>
          </select>
        </div>

        {/* Подразделы */}
        <div className="mt-6">
          <h2 className="text-sm font-muller font-medium text-gray-900 mb-2">
            Подразделы
          </h2>
          {subsections.map((row, idx) => (
            <div key={idx} className="flex gap-3 mb-3">
              <input
                type="text"
                placeholder="Выберите подраздел"
                value={row.name}
                onChange={(e) => updateSubsection(idx, "name", e.target.value)}
                className="flex-1 rounded-xl bg-blue-50 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Цена"
                value={row.price}
                onChange={(e) => updateSubsection(idx, "price", e.target.value)}
                className="w-32 rounded-xl bg-blue-50 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addSubsection}
            className="mt-1 text-sm inline-flex items-center gap-2 text-blue-700 hover:text-blue-800"
          >
            <img alt="add" className="h-4 w-4" src={plus} />
            Добавить подраздел
          </button>
        </div>

        {/* Стаж */}
        <div className="mt-8">
          <label className="block text-sm font-muller text-gray-900 mb-1">
            Укажите ваш стаж преподавания в годах
          </label>
          <input
            type="number"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="mt-1 w-full rounded-xl bg-blue-50 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
            placeholder="Например: 5"
          />
        </div>

        {/* Кнопки */}
        <div className="mt-10 flex gap-4">
          <button className="rounded-full bg-blue-600 text-white font-muller font-medium py-3 px-6 hover:bg-blue-700">
            Сохранить
          </button>
          <button className="rounded-full border-2 border-gray-300 text-gray-700 font-muller font-medium py-3 px-6 hover:bg-gray-50">
            Отмена
          </button>
        </div>
      </main>
    </div>
  );
}
