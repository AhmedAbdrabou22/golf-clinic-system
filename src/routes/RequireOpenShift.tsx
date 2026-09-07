import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// يمنع الدخول لأي صفحة تانية في السيستم قبل ما المستخدم يفتح الشفت بتاعه
const RequireOpenShift = () => {
  const { hasOpenShift } = useAuth();

  if (!hasOpenShift) {
    return <Navigate to="/open-shift" replace />;
  }

  return <Outlet />;
};

export default RequireOpenShift;