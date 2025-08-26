import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./views/Header";
import HeaderPader from "./views/HeaderPader";
import LoginPage from "./auth/Login";
import Verify from "./auth/Verify";
import Welcome from "./auth/Welcome";
import StudentRoutes from "./student/StudentRoutes";
import TutorRoutes from "./tutor/TutorRoutes";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <Header />
      <HeaderPader/>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/tutor/*" element={<TutorRoutes />} />
          <Route path="/student/*" element={<StudentRoutes />} />
          <Route path="/" element={<Welcome />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </>
  );
}
