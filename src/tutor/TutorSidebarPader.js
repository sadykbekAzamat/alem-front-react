import { Link } from "react-router-dom";
import { Home, Calendar } from "lucide-react";

export default function TutorSidebar() {
  return (
    <div className="top-100 left-0 h-full w-20 bg-gray-50 flex flex-col items-center py-4 shadow-md">
      <nav className="flex flex-col gap-6">
        <Link
          to="/"
          className="flex flex-col items-center gap-1 text-black hover:text-blue-600 transition"
        >
          <Home size={28} />
          <span className="text-xs font-medium">Home</span>
        </Link>

        <Link
          to="/calendar"
          className="flex flex-col items-center gap-1 text-black hover:text-blue-600 transition"
        >
          <Calendar size={28} />
          <span className="text-xs font-medium">Calendar</span>
        </Link>
      </nav>
    </div>
  );
}
