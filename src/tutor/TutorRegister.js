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

const LEVEL_OPTIONS = [
  { value: "A1", label: "Начальный (A1)" },
  { value: "A2", label: "Ниже среднего (A2)" },
  { value: "B1", label: "Средний (B1)" },
  { value: "B2", label: "Выше среднего (B2)" },
  { value: "C1", label: "Продвинутый (C1)" },
  { value: "C2", label: "Носитель языка (C2)" },
];

/* ===== Утилиты телефона ===== */
const onlyDigits = (s) => s.replace(/\D/g, "");
const formatPhone = (raw) => {
  // Маска под +7 777 777 77 77
  const d = onlyDigits(raw);
  const withCountry = d.startsWith("7")
    ? d
    : d.startsWith("8")
    ? "7" + d.slice(1)
    : d;
  let out = "+";
  for (let i = 0; i < withCountry.length; i++) {
    const ch = withCountry[i];
    if (i === 0) out += ch + " ";
    else if (i === 3 || i === 6 || i === 8) out += withCountry[i] + " ";
    else out += ch;
  }
  return out.trim();
};
const isKzRuPhone = (raw) => {
  const d = onlyDigits(raw);
  return d.length === 11 && d[0] === "7";
};
const maskPhone = (raw) => {
  const d = onlyDigits(raw);
  if (d.length < 11) return "";
  return `+7 (${d.slice(1, 4)}) ${d.slice(4, 6)} ** ${d.slice(8, 10)}`;
};

export default function TutorRegister() {
  const API_URL = process.env.REACT_APP_API;
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("male");
  const [agree, setAgree] = useState(false);

  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const inputFileRef = useRef(null);

  const [langs, setLangs] = useState([{ language: "", level: "" }]);

  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phoneStep, setPhoneStep] = useState("enter");
  const [phone, setPhone] = useState("+7 ");
  const [phoneVerified, setPhoneVerified] = useState(false);

const mapLangCode = (v) => {
  if (v === "kk") return "kz";
  return v || "";
};

const mapLevelToApi = (v) => (v === "C2" ? "native" : v);


  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (!resendIn) return;
    const t = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const startTimer = (seconds = 120) => setResendIn(seconds);

  const openPhoneModal = () => {
    setPhoneModalOpen(true);
    setPhoneStep("enter");
  };
  const closePhoneModal = () => {
    setPhoneModalOpen(false);
    setOtp(["", "", "", "", "", ""]);
    setResendIn(0);
  };

  const sendOtp = async () => {
    if (!isKzRuPhone(phone)) {
      toast.error("Введите корректный номер +7XXXXXXXXXX.");
      return;
    }
    try {
      // TODO: замените на ваш API
      // await fetch('/api/otp/send', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ phone: `+${onlyDigits(phone)}` }) });
      toast.success("Код отправлен по SMS");
      setPhoneStep("verify");
      startTimer(120);
      setTimeout(() => otpRefs[0].current?.focus(), 0);
    } catch {
      toast.error("Не удалось отправить код. Попробуйте снова.");
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;
    try {
      // TODO: замените на ваш API
      // await fetch('/api/otp/verify', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ phone: `+${onlyDigits(phone)}`, code }) });
      setPhoneVerified(true);
      toast.success("Номер подтверждён!");
      closePhoneModal();
    } catch {
      toast.error("Неверный код. Попробуйте ещё раз.");
    }
  };

  const onOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs[idx + 1].current?.focus();
    if (next.join("").length === 6) verifyOtp();
  };
  const onOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      otpRefs[idx - 1].current?.focus();
  };
  const resendOtp = async () => {
    if (resendIn > 0) return;
    await sendOtp();
  };

  /* ===== Фото ===== */
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

  /* ===== Языки ===== */
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

  /* ===== Валидация ===== */
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

  const token =
    localStorage.getItem("token");

  if (!token) {
    toast.error("Не найден токен авторизации.");
    return;
  }

  // Build payload exactly as API expects
  const payload = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    gender, // "male" | "female"

    // Only send if it's a real URL (blob: URLs from ObjectURL won't work for the server)
    ...(photoUrl && /^https?:\/\//i.test(photoUrl) ? { photoUrl } : {}),

    languages: langs.map((l) => ({
      code: mapLangCode(l.language),            // e.g. "kz", "en", "ru"
      proficiency: mapLevelToApi(l.level),      // e.g. "native", "C1", "B2", ...
    })),
  };

  try {
    const res = await fetch(
      `${API_URL}/api/v1/tutors/profile/create`,
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
      const errText = await res.text().catch(() => "");
      throw new Error(errText || `HTTP ${res.status}`);
    }

    toast.success("Профиль сохранён!");
    navigate("/tutor/profile/about");
  } catch (err) {
    console.error(err);
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
          {/* Фото */}
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
            className="mt-1 w-full font-muller font-regular rounded-xl bg-blue-50 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="mt-4 block text-sm font-muller font-medium text-gray-900">
            Фамилия
          </label>
          <input
            type="text"
            placeholder="Введите вашу фамилию"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 w-full font-muller font-regular rounded-xl bg-blue-50 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full appearance-none rounded-xl bg-blue-50 px-3 py-2 pr-9 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full appearance-none rounded-xl bg-blue-50 px-3 py-2 pr-9 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* ===== Телефон: кнопка над соглашением ===== */}
          <div className="mt-6">
            <button
              hidden={phoneVerified}
              type="button"
              onClick={openPhoneModal}
              className="px-4 py-2 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50 font-muller font-medium"
            >
              Добавить тел. номер
            </button>
            {phoneVerified && (
              <div className="mt-2 font-muller font-medium text-gray-700">
                Номер подтверждён:{" "}
                <span className="font-medium">{maskPhone(phone)}</span>
                <button
                  hidden
                  type="button"
                  onClick={openPhoneModal}
                  className="ml-2 underline text-blue-700"
                >
                  Изменить
                </button>
              </div>
            )}
          </div>

          {/* Соглашение */}
          <label className="mt-6 flex flex-wrap items-start gap-2 font-muller text-gray-900">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
            />
            <span>
              Продолжая, я принимаю{" "}
              <a
                href="/terms"
                className="text-blue-700 underline underline-offset-2"
              >
                Пользовательское соглашение
              </a>
              .
            </span>
          </label>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={!isFormValid()}
              className="w-full px-6 py-2 rounded-full bg-blue-600 text-white font-muller font-medium hover:bg-blue-700 disabled:bg-blue-300"
            >
              Продолжить
            </button>
          </div>
        </form>
      </main>

      {/* ===== MODAL: телефон/OTP ===== */}
      {phoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closePhoneModal}
          />
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:text-gray-600"
              onClick={closePhoneModal}
              aria-label="Закрыть"
            >
              ×
            </button>

            {phoneStep === "enter" && (
              <>
                <h2 className="text-xl font-muller font-bold mb-4">
                  Добавление номера телефона
                </h2>
                <label className="text-sm text-gray-800">
                  Введите номер телефона
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="+7 777 777 77 77"
                  className="mt-2 w-full rounded-xl bg-blue-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendOtp}
                  className="mt-5 w-full rounded-full bg-blue-600 py-3 text-white font-muller font-medium hover:bg-blue-700 disabled:bg-blue-300"
                >
                  Продолжить
                </button>
              </>
            )}

            {phoneStep === "verify" && (
              <>
                <h2 className="text-xl font-muller font-bold mb-2">
                  Введите код
                </h2>
                <p className="text-sm text-gray-700">
                  Введите код из SMS, отправленный на номер:{" "}
                  <span className="font-medium">{maskPhone(phone)}</span>
                </p>

                <div className="mt-4 flex items-center justify-between gap-2">
                  {otp.map((val, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      inputMode="numeric"
                      maxLength={1}
                      value={val}
                      onChange={(e) => onOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => onOtpKeyDown(idx, e)}
                      className="h-14 w-14 text-center text-xl rounded-xl bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  {resendIn > 0 ? (
                    <>
                      Получить новый код можно через:{" "}
                      {Math.floor(resendIn / 60)}:
                      {String(resendIn % 60).padStart(2, "0")}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={resendOtp}
                      className="underline text-blue-700"
                    >
                      Отправить код ещё раз
                    </button>
                  )}
                </div>

                <button
                  onClick={verifyOtp}
                  disabled={otp.join("").length !== 6}
                  className="mt-5 w-full rounded-full bg-blue-600 py-3 text-white font-muller font-medium hover:bg-blue-700 disabled:bg-blue-300"
                >
                  Подтвердить
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
