//ProfileRoutes.js
import { Routes, Route, Navigate } from "react-router-dom";
import ProfileTab from "./TutorProfileTab";
import TutorAbout from "./TutorAbout";
import TutorSurvey from "./TutorSurvey";
import TutorReferral from "./TutorReferral";

export default function TutorProfileRoutes() {
  return (
    <div className="w-full">
      <ProfileTab />
      <div className="mt-6">
        <Routes>
          <Route index element={<Navigate to="about" replace />} />
          <Route path="about" element={<TutorAbout />} />
          <Route path="survey" element={<TutorSurvey />} />
          <Route path="referral" element={<TutorReferral />} />
          
        </Routes>
      </div>
    </div>
  );
}
