import { Link } from "react-router-dom";
import { Home, Calendar, Book, User } from "lucide-react";

export default function TutorSidebar() {
  return (
    <div className="fixed top-100 left-0 h-full w-20 bg-gray-50 flex flex-col items-center py-4 shadow-md">
      <nav className="flex flex-col gap-6">
        <Link
          to="/tutor/profile"
          className="flex flex-col items-center gap-1 text-black hover:text-blue-600 transition"
        >
          <User size={28} />
          <span className="text-xs font-muller font-medium">Профиль</span>
        </Link>

        <Link
          to="/tutor/lessons"
          className="flex flex-col items-center gap-1 text-black hover:text-blue-600 transition"
        >
          <Book size={28} />
          <span className="text-xs font-muller font-medium">Уроки</span>
        </Link>

        <Link
          to="/calendar"
          className="flex flex-col items-center gap-1 text-black hover:text-blue-600 transition"
        >
          <Calendar size={28} />
          <span className="text-xs font-muller font-medium">Календарь</span>
        </Link>
      </nav>
    </div>
  );
}
