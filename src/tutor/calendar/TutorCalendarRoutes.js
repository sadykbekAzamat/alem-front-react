//ProfileRoutes.js
import { Routes, Route, Navigate } from "react-router-dom";
import TutorLessonsTab from "./TutorCalendarTab";
import TutorCalendarTimetable from "./TutorCalendarTimetable";
import TutorCalendarSettings from "./TutorCalendarSettings";
import TutorCalendarGoogle from "./TutorCalendarGoogle";
import TutorCalendarCalendar from "./TutorCalendarCalendar";

export default function TutorCalendarRoutes() {
  return (
    <div className="w-full">
      <TutorLessonsTab />
      <div className="mt-6">
        <Routes>
          <Route index element={<Navigate to="calendar" replace />} />
          <Route path="timetable" element={<TutorCalendarTimetable />} />
          <Route path="settings" element={<TutorCalendarSettings />} />
          <Route path="google" element={<TutorCalendarGoogle />} />
          <Route path="calendar" element={<TutorCalendarCalendar />} />          
        </Routes>
      </div>
    </div>
  );
}
