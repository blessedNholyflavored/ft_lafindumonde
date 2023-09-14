import React from 'react';
import "./../../App.css";
import "./../../style/Profile.css";
import "./../../style/Login.css";
import logo from "../../img/logo42.png";
import icon from "../../img/buttoncomp.png"
import { useAuth } from "./AuthProvider";
import { useNavigate } from 'react-router-dom';

export function Login () {
    const { user } = useAuth();
	const navigate = useNavigate();

    // si user a ete set (donc est log)
    // on peut acceder a Home
    if (user){
        navigate("/");
    }

    //on fait appel au service d'auth dans le back
    const fortyTwoLogin = () => {
        window.location.href = 'http://localhost:3001/auth/login42';
    }

	const register = () => {
		navigate("/register");
	}

	const localSignIn = () => {
		navigate("/local_login");
	}

    return (
        <div className="Login">
            <div className="logoAuth">
		        <img src={logo} className="logo" alt="icon" />
            </div>
            <div className="boxAuth">
                <div className="navbarbox navAuth">
			        <img src={icon} className="buttonnav" alt="icon" />
    			    <p className="navTitle"> WELCOME, PLAYER </p>
                    <p className="navTitle"> ▷</p>
                </div>
                <div className='boxAuthContent'>
                    <img src='./login.png' onClick={fortyTwoLogin} alt="login button" />
                    <p> LOG W/ 42</p>
					<p>I don't have a 42 account !</p>
					<button className="registerbtn"onClick={register}>/REGISTER</button>
					<button className="signinbtn"onClick={localSignIn}>/SIGN IN</button>
		        </div>
            </div>
        </div>
    )
}
