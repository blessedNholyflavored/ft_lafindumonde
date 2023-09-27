import "./../../App.css";
import { Navigate } from "react-router-dom";
import { useAuth, User } from "./AuthProvider";

export const ProtectedRoute = ({ children }: { children: any }) => {
  const { user }: { user: User | null } = useAuth();

  // if you're not logged, you're redirected to login page
  // else the component targeted is displayed
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default ProtectedRoute;
