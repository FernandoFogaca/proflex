import { Navigate } from "react-router-dom";
import { logged } from "./session";

// se não estiver logado, manda pro login
export default function ProtectedRoute({ children }) {
  return logged() ? children : <Navigate to="/login" replace />;
}
