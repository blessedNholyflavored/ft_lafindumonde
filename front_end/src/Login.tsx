import React from 'react';
import "./App.css";
import "./Login.css";
import { useAuth } from "./AuthProvider";
import { Navigate } from 'react-router-dom';

export function Login () {
    const { user } = useAuth();

    // si user a ete set (donc est log)
    // on peut acceder a Home
    if (user){
        return <Navigate to="/" />;
    }

    //on fait appel au service d'auth dans le back
    const fortyTwoLogin = () => {
        window.location.href = 'http://localhost:3000/auth/login42';
    }

    return (
        <div className="Login">
            <h1>Login Page</h1>
            <img src='./login.png' onClick={fortyTwoLogin} alt="login button" />
        </div>
    )
}