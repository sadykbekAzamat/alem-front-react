import { Routes, Route } from "react-router-dom";
import RegisterTutor from "./RegisterTutor";
import TutorSidebar from "./TutorSidebar";
import TutorSidebarPader from "./TutorSidebarPader";

export default function TutorRoutes() {
  return (
    <>
      <div className="flex">
        <TutorSidebar />
        <TutorSidebarPader />
        <div className="flex-1">
          <Routes>
            <Route path="/register" element={<RegisterTutor />} />
          </Routes>
        </div>
      </div>
    </>
  );
}
