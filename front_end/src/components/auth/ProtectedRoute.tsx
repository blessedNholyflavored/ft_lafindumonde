//import { useEffect } from 'react';
//import axios from 'axios';
import "./../../App.css";
import { Navigate } from 'react-router-dom';
import { useAuth, User } from "./AuthProvider";

export const ProtectedRoute = ({ children }: {children: any}) => {
    const { user }: { user: User | null } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }
    return children;
};

export default ProtectedRoute;