// src/pages/TutorRoutes.js
import { Routes, Route, Outlet } from "react-router-dom";
import RegisterTutor from "./TutorRegister";
import TutorSidebar from "./TutorSidebar";
import TutorSidebarPader from "./TutorSidebarPader";
import TutorProfileRoutes from "./profile/TutorProfileRoutes";
import TutorLessonsRoutes from "./lessons/TutorLessonsRoutes";

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
      <Route path="/register" element={<RegisterTutor />} />

      <Route element={<WithSidebarLayout />}>
        <Route path="/profile/*" element={<TutorProfileRoutes />} />
        <Route path="/lessons/*" element={<TutorLessonsRoutes />} />
      </Route>
    </Routes>
  );
}
