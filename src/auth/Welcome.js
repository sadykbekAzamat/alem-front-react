// WelcomePage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import img1 from "../assets/img/looking-for-tutor.png";
import img2 from "../assets/img/wannabe-tutor.png";

export default function WelcomePage() {

  const ME_URL = `${process.env.REACT_APP_API}/api/v1/auth/me`;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const fetchMe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return null;
    }
    try {
      const res = await fetch(ME_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.status === 401) {
        navigate("/login");
        return null;
      }
      if (!res.ok) {
        toast.error("Не удалось получить профиль.");
        return null;
      }
      const data = await res.json();
      return data;
    } catch {
      toast.error("Ошибка сети. Попробуйте ещё раз.");
      return null;
    }
  };

  const handleBecomeTutor = async () => {
    const data = await fetchMe();
    if (!data) return;
    const firstName = (data.user?.firstName || "").trim();
    if (firstName) {
      navigate("/tutor/profile/about");
    } else {
      navigate("/tutor/register");
    }
  };

  const handleFindTutor = async () => {
    const data = await fetchMe();
    if (!data) return;
    const firstName = (data.user?.firstName || "").trim();
    if (firstName) {
      // предположительный путь профиля студента
      navigate("/student/profile");
    } else {
      navigate("/student/register");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-10 to-gray-50 px-4">
      <div hidden className="w-full items-left mt-3">
        <button
          onClick={() => navigate(-1)}
          className="top-6 left-6 flex items-center text-blue-600 font-muller font-bold"
          aria-label="Назад"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад
        </button>
      </div>

      <main className="w-full max-w-xl text-center mb-[10%]">
        <h1 className="text-5xl font-muller font-bold text-gray-900">Добро пожаловать в Alem!</h1>
        <p className="mt-2 text-gray-700 font-muller">С какой целью вы к нам пришли?</p>

        <div className="mt-8 flex flex-col items-stretch gap-4">
          {/* Card 1 */}
          <button
            type="button"
            onClick={handleBecomeTutor}
            className="w-full rounded-2xl border-2 border-gray-100 bg-white p-6 text-left shadow-sm transition hover:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-[0.99]"
          >
            <div className="flex items-center">
              <div className="mr-4 flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#E5FA00]">
                  <img src={img2} alt="Иконка репетитора" width={64} height={64} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-muller font-medium text-zinc-900 sm:text-xl">Стать репетитором</h3>
                <p className="text-sm text-zinc-500">Удобное расписание занятий</p>
              </div>
              <div className="ml-2 flex flex-shrink-0 items-center text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Card 2 */}
          <button
            type="button"
            onClick={handleFindTutor}
            className="w-full rounded-2xl border-2 border-gray-100 bg-white p-6 text-left shadow-sm transition hover:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-[0.99]"
          >
            <div className="flex items-center">
              <div className="mr-4 flex-shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#AC83F9]">
                  <img src={img1} alt="Иконка поиска репетитора" width={64} height={64} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-muller font-medium text-zinc-900 sm:text-xl">Найти репетитора</h3>
                <p className="text-sm text-zinc-500">Опытные и проверенные преподаватели</p>
              </div>
              <div className="ml-2 flex flex-shrink-0 items-center text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          <p className="mt-2 text-xs text-gray-500">Вы всегда сможете изменить выбор позже в настройках профиля.</p>
        </div>
      </main>
    </div>
  );
}
