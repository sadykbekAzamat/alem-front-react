// Verify.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CODE_LENGTH = 6;
const VERIFY_URL =
  process.env.REACT_APP_AUTH_VERIFY_URL ||
  "https://auth-service-58sq.onrender.com/api/v1/auth/otp/verify";
const REQUEST_URL =
  process.env.REACT_APP_AUTH_REQUEST_URL ||
  "https://auth-service-58sq.onrender.com/api/v1/auth/otp/request";

export default function Verify() {
  const [code, setCode] = useState(Array.from({ length: CODE_LENGTH }, () => ""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Email comes from previous page via navigate("/verify", { state: { email } })
  const email =
    (location.state && location.state.email) ||
    localStorage.getItem("pendingEmail") ||
    ""; // fallback if not provided

  useEffect(() => {
    // Focus the first input on mount
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return; // only one digit
    const next = [...code];
    next[index] = value;
    setCode(next);

    if (value && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prev = [...code];
      prev[index - 1] = "";
      setCode(prev);
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = pasted.split("");
    while (next.length < CODE_LENGTH) next.push("");
    setCode(next);
    const firstEmpty = next.findIndex((d) => !d);
    const focusIndex = firstEmpty === -1 ? CODE_LENGTH - 1 : firstEmpty;
    inputsRef.current[focusIndex]?.focus();
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredCode = code.join("");
    if (enteredCode.length !== CODE_LENGTH) {
      toast.error(`Введите ${CODE_LENGTH}-значный код`);
      return;
    }
    if (!email) {
      toast.error("Не найден email для подтверждения. Вернитесь назад.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: enteredCode }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        const msg = data?.message || data?.error || "Неверный код. Попробуйте ещё раз.";
        throw new Error(msg);
      }

      const token = data?.token || data?.accessToken || data?.data?.token;
      const refreshToken = data?.data?.refreshToken;
      if (!token) {
        toast.success("Код подтверждён, но токен не получен.");
      } else {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
      }
      toast.success("Успешная верификация!");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Ошибка при подтверждении кода.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Не найден email для повторной отправки.");
      return;
    }
    try {
      setIsResending(true);
      const res = await fetch(REQUEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Не удалось отправить код повторно.");
      toast.success("Код отправлен повторно. Проверьте папку «Спам».");
    } catch (err) {
      toast.error(err.message || "Ошибка при повторной отправке.");
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = email
    ? (() => {
        const [name, domain] = email.split("@");
        if (!name || !domain) return email;
        const visible = Math.min(2, name.length);
        return `${name.slice(0, visible)}${"*".repeat(Math.max(0, name.length - visible))}@${domain}`;
      })()
    : "—";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center text-blue-600 font-muller font-bold"
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Назад
      </button>

      <div className="w-full max-w-xl text-center mb-[10%]">
        <h1 className="text-5xl font-muller font-bold text-gray-900">Введите код</h1>
        <p className="mt-2 text-gray-700 font-muller flex justify-center">
          Введите код, отправленный на email:&nbsp;
          <span className="font-bold">{maskedEmail}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col items-center gap-6">
          <div className="flex gap-4" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputsRef.current[index] = el)}
                className="w-14 h-14 text-center text-2xl font-bold rounded-xl bg-blue-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                disabled={isLoading}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="w-fit px-6 py-2 rounded-full bg-blue-600 text-white font-muller font-medium
                         hover:bg-blue-700 disabled:bg-blue-300"
              disabled={isLoading}
            >
              {isLoading ? "Подтверждаем…" : "Подтвердить"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              className="w-fit px-6 py-2 rounded-full border border-blue-600 text-blue-600 font-muller font-medium
                         hover:bg-blue-50 disabled:opacity-60"
              disabled={isResending || isLoading}
            >
              {isResending ? "Отправляем…" : "Отправить код повторно"}
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Не нашли письмо? Проверьте папку «Спам» или попробуйте отправить код повторно.
          </p>
        </form>
      </div>
    </div>
  );
}
