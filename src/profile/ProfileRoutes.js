//ProfileRoutes.js
import { Routes, Route, Navigate } from "react-router-dom";
import ProfileTab from "./ProfileTab";
import About from "./About";
import Survey from "./Survey";
import Referral from "./Referral";

export default function ProfileRoutes() {
  return (
    <div className="w-full">
      <ProfileTab />
      <div className="mt-6">
        <Routes>
          <Route index element={<Navigate to="about" replace />} />
          <Route path="about" element={<About />} />
          <Route path="survey" element={<Survey />} />
          <Route path="referral" element={<Referral />} />
          
        </Routes>
      </div>
    </div>
  );
}
