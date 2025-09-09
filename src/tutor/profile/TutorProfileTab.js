// src/pages/tutor/ProfileTab.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import warning_ from "../../assets/img/warning.png";
import api from "../../utils/apiClient";

const ALL_TABS = [
  { label: "О себе", path: "about" },
  { label: "Предметы", path: "subjects" },
  { label: "Видео", path: "video" },
  { label: "Отзывы", path: "reviews" },
  { label: "Реферальная система", path: "referral" },
  // “Анкетирование” will be conditionally added
  { label: "Анкетирование", path: "survey", warning: true, _conditional: true },
];

export default function TutorProfileTab() {
  const { pathname } = useLocation();
  const API = process.env.REACT_APP_API;

  // Hidden by default; will be enabled if verification !== 'verified'
  const [showSurvey, setShowSurvey] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // who am i
        const meRes = await api.get(`${API}/api/v1/auth/me`);
        if (!meRes.ok) throw new Error(`auth/me ${meRes.status}`);
        const me = (await meRes.json())?.user;

        if (!me?.id) return;

        // tutor profile
        const tRes = await api.get(`${API}/api/v1/tutors/${me.id}`);
        if (!tRes.ok) throw new Error(`tutor ${tRes.status}`);
        const tutor = await tRes.json();

        // show tab for any state except verified
        if (alive) setShowSurvey(tutor?.verification !== "verified");
      } catch {
        // keep default: hidden
        if (alive) setShowSurvey(false);
      }
    })();
    return () => { alive = false; };
  }, [API]);

  // build tabs list based on showSurvey
  const tabs = useMemo(
    () =>
      ALL_TABS.filter((t) => !t._conditional || showSurvey).map(({ _conditional, ...rest }) => rest),
    [showSurvey]
  );

  const tabSlugs = tabs.map((t) => t.path);

  const base = (() => {
    const hit = tabSlugs.find((slug) => pathname.endsWith(`/${slug}`));
    if (!hit) return pathname.replace(/\/+$/, "");
    return pathname.slice(0, pathname.lastIndexOf(`/${hit}`)) || "/";
  })();

  return (
    <div className="w-full pl-6 pt-3">
      <h1 className="text-2xl font-muller font-bold text-gray-900 mb-4">Мой профиль</h1>

      <nav className="flex gap-5 text-xs font-medium">
        {tabs.map((tab) => {
          const to = `${base}/${tab.path}`.replace(/\/{2,}/g, "/");
          return (
            <NavLink
              key={tab.path}
              to={to}
              end
              className={({ isActive }) =>
                `pb-1 transition-colors ${
                  isActive
                    ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-800 hover:border-b-2"
                }`
              }
            >
              <div className="flex items-center">
                {tab.label}
                {tab.path === "survey" && showSurvey && (
                  <img className="ml-1 w-4 h-4" alt="warning" src={warning_} />
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
