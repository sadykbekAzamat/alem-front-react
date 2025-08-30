//ProfileRoutes.js
import { Routes, Route, Navigate } from "react-router-dom";
import TutorLessonsTab from "./TutorLessonsTab";
import TutorLessonsArchive from "./TutorLessonsArchive";
import TutorLessonsActive from "./TutorLessonsActive";

export default function TutorLessonsRoutes() {
  return (
    <div className="w-full">
      <TutorLessonsTab />
      <div className="mt-6">
        <Routes>
          <Route index element={<Navigate to="active" replace />} />
          <Route path="archive" element={<TutorLessonsArchive />} />
          <Route path="active" element={<TutorLessonsActive />} />
          
        </Routes>
      </div>
    </div>
  );
}
