// login.js
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function InitEmailPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const errorRef = useRef(null);

  const API_URL =
    `${process.env.REACT_APP_API}/api/v1/auth/otp/request`;

  const validateEmail = (value) => {
    // Moderate validation; let the backend be the ultimate source of truth
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return re.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      setError("Пожалуйста, введите корректный адрес электронной почты.");
      // focus the error message for screen readers
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      // Try to parse JSON safely (some errors may not return JSON)
      let data = null;
      try {
        data = await res.json();
      } catch (_) {
        // ignore JSON parse errors; we'll fall back to generic messages
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          "Ошибка. Проверьте адрес электронной почты.";
        throw new Error(msg);
      }

      // Optional: you may check for data.success if your API returns it
      // if (!data?.success) throw new Error("Ошибка при обработке email.");

      // Success → go to verification step
      navigate("/verify", { state: { email: normalizedEmail } });
    } catch (err) {
      setError(err.message || "Произошла непредвиденная ошибка.");
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 w-full">
          <div className="space-y-4">
            <h1 className="text-2xl font-muller font-bold">Alem</h1>
            <p className="text-gray-500 font-muller font-regular">
              Введите вашу электронную почту
            </p>
          </div>

          <div className="mt-6">
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                tabIndex={-1}
                ref={errorRef}
                className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              aria-busy={isLoading ? "true" : "false"}
            >
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-base font-muller font-medium text-gray-700"
                >
                  Электронная почта
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-xl border-blue-600 shadow-sm 
                             focus:border-blue-500 focus:ring-blue-600 
                             sm:text-md p-2 border-2"
                  autoComplete="email"
                  inputMode="email"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="w-full font-muller font-medium bg-blue-500 text-white 
                           py-2 px-4 rounded-3xl text-lg font-semibold 
                           hover:bg-blue-600 focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:ring-offset-2 
                           disabled:bg-blue-300"
                disabled={isLoading}
              >
                {isLoading ? "Отправляем…" : "Продолжить"}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 font-muller max-w-sm text-center text-xs text-gray-500">
          Продолжая, вы принимаете Политику конфиденциальности и Условия
          сервиса.
        </p>
      </div>
    </div>
  );
}
