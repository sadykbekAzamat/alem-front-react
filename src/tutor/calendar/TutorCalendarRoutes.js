//ProfileRoutes.js
import { Routes, Route, Navigate } from "react-router-dom";
import TutorLessonsTab from "./TutorCalendarTab";
import TutorCalendarTimetable from "./TutorCalendarTimetable";
import TutorCalendarSettings from "./TutorCalendarSettings";

export default function TutorCalendarRoutes() {
  return (
    <div className="w-full">
      <TutorLessonsTab />
      <div className="mt-6">
        <Routes>
          <Route index element={<Navigate to="calendar" replace />} />
          <Route path="timetable" element={<TutorCalendarTimetable />} />
          <Route path="settings" element={<TutorCalendarSettings />} />
          
        </Routes>
      </div>
    </div>
  );
}
