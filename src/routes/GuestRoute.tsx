import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const GuestRoute = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default GuestRoute;
