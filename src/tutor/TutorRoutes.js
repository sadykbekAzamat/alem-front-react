// src/pages/TutorRoutes.js
import { Routes, Route, Outlet } from "react-router-dom";
import RegisterTutor from "./RegisterTutor";
import TutorSidebar from "./TutorSidebar";
import TutorSidebarPader from "./TutorSidebarPader";
import ProfileRoutes from "../profile/ProfileRoutes";

// Layout c сайдбаром
function WithSidebarLayout() {
  return (
    <div className="flex">
      <TutorSidebar />
      <TutorSidebarPader />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default function TutorRoutes() {
  return (
    <Routes>
      {/* Страница регистрации БЕЗ сайдбара */}
      <Route path="/register" element={<RegisterTutor />} />

      {/* Все страницы ниже — С сайдбаром */}
      <Route element={<WithSidebarLayout />}>
        <Route path="/profile/*" element={<ProfileRoutes />} />
        {/* добавляйте сюда другие роуты, которым нужен сайдбар */}
      </Route>
    </Routes>
  );
}
