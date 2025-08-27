// Referral.js
import { useState } from "react";
import toast from "react-hot-toast";

export default function Referral() {
  const [refLink] = useState(
    "https://localhost:3000/ref/alemdegibalapan..." // replace with API response if needed
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(refLink);
      toast.success("Ссылка скопирована!");
    } catch {
      toast.error("Не удалось скопировать ссылку.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <main className="w-full max-w-4xl mx-auto">
        <h1 className="text-2xl font-muller font-bold text-gray-900 mb-6">
          Реферальная система
        </h1>

        {/* Ваша ссылка */}
        <div>
          <label className="block text-sm font-muller text-gray-900 mb-2">
            Ваша ссылка:
          </label>
          <div className="flex items-center gap-2 bg-white rounded-xl border px-3 py-2">
            <a
              href={refLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate flex-1 text-sm"
            >
              {refLink}
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-medium"
            >
              Копировать
            </button>
          </div>
        </div>

        {/* Как это работает */}
        <div className="mt-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4">
          <h2 className="text-base font-muller font-semibold text-yellow-700 mb-2">
            Как это работает?
          </h2>
          <p className="text-sm text-gray-800">
            Приглашайте друзей, делитесь ссылкой и получайте бонусы за их активность!
          </p>
        </div>

        {/* Начисления */}
        <div className="mt-8 rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-900 font-muller font-semibold mb-1">
              Пока нет начислений
            </div>
            <div className="text-sm text-gray-500">
              Поделитесь вашей ссылкой, чтобы получать бонусы.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
