import { Link, useLocation } from "react-router-dom";
import { Calendar, Book, User } from "lucide-react";

export default function TutorSidebar() {
  const location = useLocation();

  const firstSegment = (path) => {
    const s = path.replace(/^\/+/, "");
    const i = s.indexOf("/");
    return i === -1 ? s : s.slice(0, i);
  };

  const activePath = firstSegment(location.pathname.replace(/^\/?tutor\/?/, ""));

  return (
    <div className="fixed top-100 left-0 h-full w-20 bg-gray-50 flex flex-col items-center py-4 shadow-md">
      <nav className="flex flex-col gap-6">
        <Link
          to="/tutor/profile"
          className={`flex flex-col items-center gap-1 ${activePath === "profile" ? "text-blue-600" : "text-black"} hover:text-blue-600 transition`}
        >
          <User size={28} strokeWidth={1.5} />
          <span className="text-xs font-muller font-medium">Профиль</span>
        </Link>

        <Link
          to="/tutor/lessons"
          className={`flex flex-col items-center gap-1 ${activePath === "lessons" ? "text-blue-600" : "text-black"} hover:text-blue-600 transition`}
        >
          <Book size={28} strokeWidth={1.5} />
          <span className="text-xs font-muller font-medium">Уроки</span>
        </Link>

        <Link
          to="/tutor/calendar"
          className={`flex flex-col items-center gap-1 ${activePath === "calendar" ? "text-blue-600" : "text-black"} hover:text-blue-600 transition`}
        >
          <Calendar size={28} strokeWidth={1.5} />
          <span className="text-xs font-muller font-medium">Календарь</span>
        </Link>
      </nav>
    </div>
  );
}
