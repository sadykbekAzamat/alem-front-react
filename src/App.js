import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import LoginPage from "./auth/Login";
import Verify from "./auth/Verify";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify" element={<Verify />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right"  />
    </>
  );
}
