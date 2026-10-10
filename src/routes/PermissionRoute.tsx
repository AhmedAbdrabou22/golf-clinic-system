import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface Props {
  permission?: string;
  children: React.ReactNode;
}

const PermissionRoute = ({ permission, children }: Props) => {
  const { can } = useAuth();
  console.log("PermissionRoute: permission=", permission, "can=", can(permission));
  if (!can(permission)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default PermissionRoute;