///ProfileTab.jsx
import { NavLink, useLocation } from "react-router-dom";
import warning_ from "../../assets/img/warning.png";

const tabs = [
  { label: "Календарь", path: "calendar" },
  { label: "Расписание", path: "timetable" },
  { label: "Запись на уроки", path: "settings" },
  { label: "Google Calendar", path: "google", warning: true },
];

export default function TutorCalendarTab() {
  const { pathname } = useLocation();
  const tabSlugs = tabs.map((t) => t.path);

  const base = (() => {
    const hit = tabSlugs.find((slug) => pathname.endsWith(`/${slug}`));
    if (!hit) return pathname.replace(/\/+$/, "");
    return pathname.slice(0, pathname.lastIndexOf(`/${hit}`)) || "/";
  })();

  return (
    <div className="w-full pl-6 pt-3">
      <h1 className="text-2xl font-muller font-bold text-gray-900 mb-4">Календарь</h1>
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
            <div className="flex">
              {tab.label}
              {tab.warning && (
                <img className="ml-1 w-4 h-4" alt="warning" src={warning_}/>
              )}
            </div>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
