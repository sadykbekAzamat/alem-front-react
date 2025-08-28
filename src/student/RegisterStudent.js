import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import upload from "../assets/img/upload.png";
import plus from "../assets/img/plus.png";
import down from "../assets/img/down.svg";

const MAX_FILE_MB = 2;
const ACCEPTED_TYPES = ["image/png", "image/jpeg"];

const LANGUAGE_OPTIONS = [
  { value: "ru", label: "Русский" },
  { value: "kk", label: "Казахский" },
  { value: "en", label: "Английский" },
  { value: "tr", label: "Турецкий" },
  { value: "de", label: "Немецкий" },
  { value: "fr", label: "Французский" },
];

const SUBJECT_OPTIONS = [
  { value: "math", label: "Математика" },
  { value: "ru_lang", label: "Русский язык" },
  { value: "kk_lang", label: "Казахский язык" },
  { value: "en_lang", label: "Английский язык" },
  { value: "physics", label: "Физика" },
  { value: "chemistry", label: "Химия" },
  { value: "biology", label: "Биология" },
  { value: "history", label: "История" },
  { value: "geography", label: "География" },
  { value: "cs", label: "Информатика" },
];

export default function RegisterStudent() {
  const navigate = useNavigate();
  const [languageOptions, setLanguageOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+7 (___) ___ __ __");
  const [agree, setAgree] = useState(false);

  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const inputFileRef = useRef(null);

  const mapLangCode = (v) => (v === "kk" ? "kz" : v || "");
  const [langs, setLangs] = useState([{ language: "", level: "" }]);
  const [subjects, setSubjects] = useState([""]);

  const onPickFile = () => inputFileRef.current?.click();

  const validateAndSetPhoto = (file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Допустимы только изображения PNG или JPEG.");
      return;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_MB) {
      toast.error(`Файл слишком большой. Максимум ${MAX_FILE_MB} МБ.`);
      return;
    }
    setPhoto(file);
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    validateAndSetPhoto(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetPhoto(file);
  };

  const addSubject = () => setSubjects((prev) => [...prev, ""]);

  const updateSubject = (idx, value) =>
    setSubjects((prev) => {
      // prevent duplicates
      if (value && prev.some((v, i) => i !== idx && v === value)) {
        toast.error("Этот предмет уже выбран.");
        return prev;
      }
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });

  const removeSubject = (idx) =>
    setSubjects((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev
    );

  const addLang = () =>
    setLangs((prev) => [...prev, { language: "", level: "" }]);
  const removeLang = (idx) =>
    setLangs((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev
    );
  const updateLang = (idx, key, value) =>
    setLangs((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
    );

  const toggleSubject = (value) => {
    setSubjects((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const isFormValid = () => {
    if (!firstName.trim() || !lastName.trim()) return false;
    if (!phone.replace(/\D/g, "").match(/^7\d{10}$/)) return false;
    const hasLanguages = langs.length > 0 && langs.every((l) => l.language); // only language required
    if (!hasLanguages) return false;
    const hasCompleteSubjects = subjects.length > 0 && subjects.every(Boolean);
    if (!hasCompleteSubjects) return false;
    if (!agree) return false;
    return true;
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadOptions = async () => {
      try {
        // Languages
        const langRes = await fetch(
          "https://auth-service-58sq.onrender.com/api/v1/admin/languages",
          { signal: controller.signal }
        );
        if (!langRes.ok) throw new Error(`LANG HTTP ${langRes.status}`);
        const langJson = await langRes.json();
        const langs = (langJson?.data || []).map((l) => ({
          value: l.code, // e.g. "ru" | "kz" | "en"
          label: l.name || l.code,
        }));
        setLanguageOptions(langs);

        // Sections
        const secRes = await fetch(
          "https://auth-service-58sq.onrender.com/api/v1/admin/sections",
          { signal: controller.signal }
        );
        if (!secRes.ok) throw new Error(`SECT HTTP ${secRes.status}`);
        const secJson = await secRes.json();
        const sections = (secJson?.data || []).map((s) => ({
          value: s.id, // <-- use id
          label: s?.name?.ru || s.slug, // <-- RU label
        }));
        setSectionOptions(sections);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          toast.error("Не удалось загрузить списки языков/секций");
        }
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
    return () => controller.abort();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Заполните все обязательные поля.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Нет токена авторизации");
      return;
    }

    // Build displayName like "Aisulu A."
    const fn = firstName.trim();
    const ln = lastName.trim();
    const displayName = fn && ln ? `${fn} ${ln.charAt(0)}.` : fn || ln || "";

    // Languages → default proficiency C1
    const languages = langs
      .filter((l) => l.language)
      .map((l) => ({
        code: mapLangCode(l.language), // ru | kz | en | ...
        proficiency: "C1",
      }));

    // Use http(s) photoUrl only (blob: is not reachable by backend)
    const payload = {
      firstName: fn,
      lastName: ln,
      displayName,
      ...(photoUrl && /^https?:\/\//i.test(photoUrl) ? { photoUrl } : {}),
      languages,
      interests: subjects.filter(Boolean), // section IDs
    };

    try {
      const res = await fetch(
        "https://student-service-mt3v.onrender.com/api/v1/students/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }

      toast.success("Анкета сохранена!");
      navigate("/student/profile/about");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при сохранении.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-gray-10 to-gray-50 px-4">
      <div className="w-full items-left mt-3">
        <button
          onClick={() => navigate(-1)}
          className="top-6 left-6 flex items-center text-blue-600 font-muller font-bold"
          aria-label="Назад"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Назад
        </button>
      </div>

      <main className="w-full max-w-2xl text-center mt-24 mb-20">
        <h1 className="text-4xl font-muller font-bold text-gray-900">
          Расскажите о себе
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 text-left w-full max-w-lg"
        >
          <div className="flex items-center gap-4">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white"
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Предпросмотр"
                  className="h-28 w-28 rounded-full object-cover"
                />
              ) : (
                <img className="w-10" src={upload} alt="загрузить фото" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={onPickFile}
                  className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-muller font-medium hover:bg-blue-200"
                >
                  Выбрать файл
                </button>
                <span className="text-sm font-muller text-gray-500">
                  Максимальный размер файла — {MAX_FILE_MB} МБ (png, jpeg)
                </span>
              </div>
              <input
                ref={inputFileRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <label className="mt-6 block text-sm font-muller font-medium text-gray-900">
            Имя
          </label>
          <input
            type="text"
            placeholder="Введите ваше имя"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full rounded-xl bg-blue-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="mt-4 block text-sm font-muller font-medium text-gray-900">
            Фамилия
          </label>
          <input
            type="text"
            placeholder="Введите вашу фамилию"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 w-full rounded-xl bg-blue-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="mt-5">
            <span className="block text-sm font-muller font-medium text-gray-900 mb-2">
              Языки и уровень
            </span>
            {langs.map((row, idx) => (
              <div key={idx} className="mb-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <select
                      value={row.language}
                      onChange={(e) =>
                        updateLang(idx, "language", e.target.value)
                      }
                      className="w-full appearance-none rounded-xl bg-blue-50 px-4 py-3 pr-9 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loadingOptions}
                    >
                      <option value="">
                        {loadingOptions ? "Загрузка..." : "Выберите язык"}
                      </option>
                      {languageOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>

                    <img
                      className="h-5 w-5 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      alt=""
                      src={down}
                    />
                  </div>
                </div>

                {langs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLang(idx)}
                    className="rounded-full border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                    aria-label="Удалить строку"
                  >
                    −
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addLang}
              className="mt-1 inline-flex items-center gap-2 text-blue-700 hover:text-blue-800"
            >
              <img alt="добавить" className="h-5 w-5" src={plus} />
              Добавить язык
            </button>
          </div>

          <div className="mt-6">
            <span className="block text-sm font-muller font-medium text-gray-900 mb-2">
              Какой предмет хотите изучать?
            </span>

            {subjects.length === 0 && (
              <div className="mb-3 text-sm text-gray-500">
                Добавьте первый предмет
              </div>
            )}

            {subjects.map((val, idx) => (
              <div key={idx} className="mb-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <select
                      value={val}
                      onChange={(e) => updateSubject(idx, e.target.value)}
                      disabled={loadingOptions}
                      className="w-full appearance-none rounded-xl bg-blue-50 px-4 py-3 pr-9 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">
                        {loadingOptions ? "Загрузка..." : "Выберите предмет"}
                      </option>
                      {sectionOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <img
                      className="h-5 w-5 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      alt=""
                      src={down}
                    />
                  </div>
                </div>

                {subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubject(idx)}
                    className="rounded-full border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                    aria-label="Удалить строку"
                  >
                    −
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addSubject}
              disabled={loadingOptions}
              className="mt-1 inline-flex items-center gap-2 text-blue-700 hover:text-blue-800"
            >
              <img alt="добавить" className="h-5 w-5" src={plus} />
              Добавить предмет
            </button>
          </div>

          <label className="mt-6 block text-sm font-muller font-medium text-gray-900">
            Телефон
          </label>
          <input
            type="tel"
            inputMode="tel"
            placeholder="+7 (___) ___ __ __"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-xl bg-blue-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="mt-6 flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            Продолжая, я принимаю
            <a
              href="/terms"
              className="text-blue-700 underline underline-offset-2"
            >
              {" "}
              правила и условия публичной оферты
            </a>
          </label>

          <div className="mt-6 flex items-center gap-3 w-full">
            <button
              type="submit"
              disabled={!isFormValid()}
              className="w-fit px-6 py-2 rounded-full bg-blue-600 text-white font-muller font-medium hover:bg-blue-700 disabled:bg-blue-300"
            >
              Продолжить
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
