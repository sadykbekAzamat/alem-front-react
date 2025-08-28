// About.js
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import upload from "../assets/img/upload.png";
import plus from "../assets/img/plus.png";
import down from "../assets/img/down.svg";

const MAX_FILE_MB = 2;
const ACCEPTED_TYPES = ["image/png", "image/jpeg"];
const ABOUT_LIMIT = 250;

const LANGUAGE_OPTIONS = [
  { value: "ru", label: "Русский" },
  { value: "kk", label: "Казахский" },
  { value: "en", label: "Английский" },
  { value: "tr", label: "Турецкий" },
  { value: "de", label: "Немецкий" },
  { value: "fr", label: "Французский" },
];

const LEVEL_OPTIONS = [
  { value: "A1", label: "A1 (Beginner)" },
  { value: "A2", label: "A2 (Elementary)" },
  { value: "B1", label: "B1 (Intermediate)" },
  { value: "B2", label: "B2 (Upper-Intermediate)" },
  { value: "C1", label: "C1 (Advanced)" },
  { value: "C2", label: "C2 (Proficient)" },
];

export default function About() {
  const navigate = useNavigate();

  // Профиль
  const [firstName, setFirstName] = useState("Aзамат".replace("A", "A")); // можно оставить ""
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+7 (___) ___ __ __");
  const [email, setEmail] = useState("");

  // Редактируемость телефона/почты как в макете с «Изменить»
  const [phoneEditable, setPhoneEditable] = useState(false);
  const [emailEditable, setEmailEditable] = useState(false);

  // Фото
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const inputFileRef = useRef(null);

  // О себе
  const [about, setAbout] = useState("");

  // Языки
  const [langs, setLangs] = useState([{ language: "ru", level: "B1" }]);

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
    setPhotoUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    validateAndSetPhoto(e.dataTransfer.files?.[0]);
  };
  const handleFileChange = (e) => validateAndSetPhoto(e.target.files?.[0]);

  // Языки
  const addLang = () => setLangs((prev) => [...prev, { language: "", level: "" }]);
  const removeLang = (idx) =>
    setLangs((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  const updateLang = (idx, key, value) =>
    setLangs((prev) => prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));

  const remaining = ABOUT_LIMIT - about.length;

  const isFormValid = () => {
    if (!firstName.trim() || !lastName.trim()) return false;
    if (!phone.replace(/\D/g, "").match(/^7\d{10}$/)) return false;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return false;
    if (!about.trim()) return false;
    if (!langs.every((l) => l.language && l.level)) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Заполните обязательные поля.");
      return;
    }
    try {
      const formData = new FormData();
      if (photo) formData.append("photo", photo);
      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("phone", phone);
      formData.append("email", email.trim());
      formData.append("about", about.trim());
      formData.append("languages", JSON.stringify(langs));

      // await fetch("/api/profile/about", { method: "POST", body: formData });

      toast.success("Изменения сохранены!");
      navigate(-1);
    } catch {
      toast.error("Ошибка при сохранении.");
    }
  };

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Нет токена авторизации");
    return;
  }

  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(
        "https://auth-service-58sq.onrender.com/api/v1/auth/me",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        }
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const json = await res.json();

      // Expected shape:
      // { success: true, user: { id, email, phone, firstName, lastName, createdAt } }
      const u = json?.user || {};

      setFirstName(u.firstName || "");
      setLastName(u.lastName || "");
      setEmail(u.email || "");
      setPhone(u.phone && u.phone.trim() ? u.phone : "+7 (___) ___ __ __");

      // Fields not present in this endpoint are left as-is:
      // about, languages, photo/photoUrl
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
        toast.error("Не удалось загрузить данные профиля");
      }
    }
  })();

  return () => controller.abort();
}, []);


  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Левая колонка */}
        <section>
          {/* Имя / Фамилия */}
          <label className="block text-xs font-muller font-medium text-gray-900">Имя</label>
          <input
            type="text"
            placeholder="Имя"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full rounded-xl bg-blue-50 px-3 py-2 font-muller font-regular text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="mt-4 block text-xs font-muller font-medium text-gray-900">Фамилия</label>
          <input
            type="text"
            placeholder="Фамилия"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 w-full rounded-xl bg-blue-50 px-3 py-2 font-muller font-regular text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Телефон c «Изменить» */}
          <div className="mt-4">
            <label className="block text-xs font-muller font-medium text-gray-900">
              Номер телефона
            </label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="tel"
                inputMode="tel"
                disabled={!phoneEditable}
                placeholder="+7 (___) ___ __ __"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-gray-900 font-muller font-regular text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  phoneEditable
                    ? "bg-blue-50 focus:ring-blue-500"
                    : "bg-gray-100 text-gray-500 focus:ring-transparent"
                }`}
              />
              <button
                type="button"
                onClick={() => setPhoneEditable((v) => !v)}
                className="text-blue-700 text-xs font-muller underline underline-offset-2"
              >
                {phoneEditable ? "Готово" : "Изменить"}
              </button>
            </div>
          </div>

          {/* Email c «Изменить» */}
          <div className="mt-4">
            <label className="block text-xs font-muller font-medium text-gray-900">Почта</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="email"
                disabled={!emailEditable}
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-gray-900 font-muller font-regular text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  emailEditable
                    ? "bg-blue-50 focus:ring-blue-500"
                    : "bg-gray-100 text-gray-500 focus:ring-transparent"
                }`}
              />
              <button
                type="button"
                onClick={() => setEmailEditable((v) => !v)}
                className="text-blue-700 text-xs font-muller underline underline-offset-2"
              >
                {emailEditable ? "Готово" : "Изменить"}
              </button>
            </div>
          </div>

          {/* Языки преподавания */}
          <div className="mt-8">
            <h2 className="text-xl font-muller font-bold text-gray-900 mb-3">
              Языки преподавания
            </h2>

            <div className="text-xs text-gray-700 mb-2">
              Язык преподавания • Уровень владения
            </div>

            {langs.map((row, idx) => (
              <div key={idx} className="mb-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <select
                      value={row.language}
                      onChange={(e) => updateLang(idx, "language", e.target.value)}
                      className="w-full w-full text-sm appearance-none rounded-xl bg-blue-50 px-3 py-2 pr-9 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Русский</option>
                      {LANGUAGE_OPTIONS.map((o) => (
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

                <div className="flex-1">
                  <div className="relative">
                    <select
                      value={row.level}
                      onChange={(e) => updateLang(idx, "level", e.target.value)}
                      className="w-full text-sm appearance-none rounded-xl bg-blue-50 px-3 py-2 pr-9 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">B1 (Intermediate) -</option>
                      {LEVEL_OPTIONS.map((o) => (
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
              className="mt-1 w-full text-sm inline-flex items-center gap-2 text-blue-700 hover:text-blue-800"
            >
              <img alt="добавить" className="h-4 w-4" src={plus} />
              Добавить язык
            </button>

            {/* Кнопки действий */}
            <div className="mt-8 flex flex-col gap-3 max-w-md">
              <button
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className="w-full rounded-full bg-blue-600 text-white font-muller font-medium py-3 hover:bg-blue-700 disabled:bg-blue-300"
              >
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full rounded-full border-2 border-red-300 text-red-600 font-muller font-medium py-3 hover:bg-red-50"
              >
                Выйти
              </button>
            </div>
          </div>
        </section>

        {/* Правая колонка: карточка с фото и описанием */}
        <section>
          <div className="rounded-2xl bg-white border border-gray-200 p-4">
            <h3 className="text-sm font-muller font-semibold text-gray-900 mb-3">
              Загрузите фото профиля
            </h3>

            <div className="flex items-center gap-3 flex-wrap mb-3">
              <button
                type="button"
                onClick={onPickFile}
                className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-muller font-medium hover:bg-blue-200 inline-flex items-center gap-2"
              >
                {/* Иконка можно опустить, оставим текст как в макете */}
                Выбрать файл
              </button>
              <span className="text-sm font-muller text-gray-500">
                Максимальный размер файла 2mb, формат png, jpeg
              </span>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="mb-4 flex h-28 w-28 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Предпросмотр" className="h-28 w-28 rounded-lg object-cover" />
              ) : (
                <img className="w-12" src={upload} alt="загрузить" />
              )}
            </div>

            {/* Оранжевая подсказка + textarea */}
            <div className="rounded-xl border border-amber-400 bg-amber-50 p-3">
              <div className="text-sm font-semibold text-amber-600 mb-2">
                Заполните ниже чтобы пройти анкету
              </div>
              <textarea
                value={about}
                maxLength={ABOUT_LIMIT}
                onChange={(e) => setAbout(e.target.value)}
                rows={6}
                className="w-full rounded-xl bg-gray-100 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Расскажите о себе и своей методике преподавания"
              />
            </div>

            <div className="mt-2 text-sm text-gray-500 flex justify-between">
              <span>Максимальное количество символов</span>
              <span>
                {remaining < 0 ? 0 : remaining}/{ABOUT_LIMIT}
              </span>
            </div>

            <input
              ref={inputFileRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Аккаунт ученика
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
