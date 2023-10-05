import "./../../App.css";
import { Navigate } from "react-router-dom";
import { useAuth, User } from "./AuthProvider";
import { useEffect } from "react";

export const ProtectedRoute = ({ children }: { children: any }) => {
  const { user }: { user: User | null } = useAuth();
  const { setUser } = useAuth();

  if (user) {
    fetch(`http://${window.location.hostname}:3000/auth/me`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (
          responseData.message != undefined &&
          responseData.message.toString() === "Unauthorized"
        ) {
          setUser(null);
          return <Navigate to="login" />;
        } else return children;
      })
      .catch(() => {
        return <Navigate to="login" />;
      });
  }
  if (!user) {
    return <Navigate to="login" />;
  }
  return children;
};

export default ProtectedRoute;
