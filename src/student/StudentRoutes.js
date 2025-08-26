import { Routes, Route } from "react-router-dom";
import RegisterStudent from "./RegisterStudent";

export default function StudentRoutes() {
  return (
    <>
        <Routes>
          <Route path="/register" element={<RegisterStudent />} />
        </Routes> 
    </>
  );
}
