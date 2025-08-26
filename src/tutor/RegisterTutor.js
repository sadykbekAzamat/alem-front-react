import { useState, useRef } from "react";
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

const LEVEL_OPTIONS = [
  { value: "A1", label: "Начальный (A1)" },
  { value: "A2", label: "Ниже среднего (A2)" },
  { value: "B1", label: "Средний (B1)" },
  { value: "B2", label: "Выше среднего (B2)" },
  { value: "C1", label: "Продвинутый (C1)" },
  { value: "C2", label: "Носитель языка (C2)" },
];

export default function RegisterTutor() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("male"); // "male" | "female"
  const [agree, setAgree] = useState(false);

  const [photo, setPhoto] = useState(null); // File | null
  const [photoUrl, setPhotoUrl] = useState(""); // preview
  const inputFileRef = useRef(null);

  const [langs, setLangs] = useState([{ language: "", level: "" }]); // минимум одна строка

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

  const isFormValid = () => {
    if (!firstName.trim() || !lastName.trim()) return false;
    const hasCompleteLang = langs.every((l) => l.language && l.level);
    if (!hasCompleteLang) return false;
    if (!agree) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Заполните все обязательные поля.");
      return;
    }

    try {
      const formData = new FormData();
      if (photo) formData.append("photo", photo);
      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("gender", gender);
      formData.append("languages", JSON.stringify(langs));


      toast.success("Профиль сохранён!");
      navigate("/"); // измените маршрут на следующий шаг, если нужно
    } catch (err) {
      toast.error("Ошибка при сохранении профиля.");
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

      <main className="w-full max-w-2xl text-center mt-4 mb-20">
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
                <img alt="a" className="w-10" src={upload} />
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
                <span className="text-sm font-muller font-regular text-gray-500">
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

          {/* Имя/Фамилия */}
          <label className="mt-6 block text-sm font-muller font-medium text-gray-900">
            Имя
          </label>
          <input
            type="text"
            placeholder="Введите ваше имя"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full font-muller font-regular rounded-xl bg-blue-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="mt-4 block text-sm font-muller font-medium text-gray-900">
            Фамилия
          </label>
          <input
            type="text"
            placeholder="Введите вашу фамилию"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 w-full font-muller font-regular rounded-xl bg-blue-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Пол */}
          <div className="mt-5">
            <span className="block font-muller font-medium text-sm font-medium text-gray-900 mb-2">
              Пол
            </span>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === "male"}
                  onChange={(e) => setGender(e.target.value)}
                  className="h-4 w-4 font-muller font-regular text-blue-600 focus:ring-blue-500"
                />
                <span className="font-muller font-regular">Мужчина</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === "female"}
                  onChange={(e) => setGender(e.target.value)}
                  className="h-4 w-4 font-muller font-regular text-blue-600 focus:ring-blue-500"
                />
                <span className="font-muller font-regular">Женщина</span>
              </label>
            </div>
          </div>

          {/* Языки */}
          <div className="mt-6 ">
            <span className="block font-muller font-medium text-sm text-gray-900 mb-2">
              Языки и уровень
            </span>

            {langs.map((row, idx) => (
              <div
                key={idx}
                className="mb-3 font-muller font-regular flex items-center gap-3"
              >
                <div className="flex-1">
                  <label className="sr-only">Язык преподавания</label>
                  <div className="relative">
                    <select
                      value={row.language}
                      onChange={(e) =>
                        updateLang(idx, "language", e.target.value)
                      }
                      className="w-full appearance-none rounded-xl bg-blue-50 px-4 py-3 pr-9 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Выберите язык</option>
                      {LANGUAGE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>

                    <img
                      className="h-5 w-5 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      alt=""
                      src={down}
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="sr-only">Уровень владения</label>
                  <div className="relative">
                    <select
                      value={row.level}
                      onChange={(e) => updateLang(idx, "level", e.target.value)}
                      className="w-full appearance-none rounded-xl bg-blue-50 px-4 py-3 pr-9 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Укажите уровень</option>
                      {LEVEL_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <img
                      className="h-5 w-5 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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
              className="mt-1 font-muller font-medium inline-flex items-center gap-2 text-blue-700 hover:text-blue-800"
            >
              <img alt="add" className="h-5 w-5 " src={plus} />
              Добавить язык
            </button>
          </div>

          {/* Соглашение */}
          <label className="font-muller font-regular mt-6 flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            Продолжая, я принимаю{" "}
            <a
              href="/terms"
              className="text-blue-700 underline underline-offset-2"
            >
              правила и условия публичной оферты
            </a>
          </label>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={!isFormValid()}
              className="w-full px-6 py-2 rounded-full bg-blue-600 text-white font-muller font-medium
                         hover:bg-blue-700 disabled:bg-blue-300"
            >
              Продолжить
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
