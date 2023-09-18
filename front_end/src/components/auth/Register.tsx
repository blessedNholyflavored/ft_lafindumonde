import React, { useState } from 'react';
import "./../../App.css";
import "./../../style/Profile.css";
import "./../../style/Login.css";
import logo from "../../img/logo42.png";
import icon from "../../img/buttoncomp.png"
import { useAuth } from "./AuthProvider";
import { Login } from "./Login";
import { useNavigate } from 'react-router-dom';

export function Register () {
    const { user, setUser } = useAuth();
	const [inputUsername, setInputUsername] = useState('');
	const [inputPassword, setInputPassword] = useState('');
	const [inputEmail, setInputEmail] = useState('');
//	const [inputPicure, setInputPicture] = useState('');
	const navigate = useNavigate();

    // si user a ete set (donc est log)
    // on peut acceder a Home
    if (user){
		navigate("/")
    }

    //on fait appel au service d'auth dans le back
    const handleSubmit = async(e: React.FormEvent) => {
		e.preventDefault();
		console.log("handle submit de register:");
		try {
			const response = await fetch(`http://localhost:3001/auth/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username: inputUsername, password: inputPassword, email: inputEmail }),
			});
			//TODO: add control of response to check if it went right
		} catch(error) {
			console.error("Error: ", error);
		}
    }
/*
	const register = () => {
		return <Navigate to="/register">;
	}

	const localSignIn = () => {
		return <Navigate to="/local_login">;
	}
*/
    return (
        <div className="Login">
            <div className="logoAuth">
		        <img src={logo} className="logo" alt="icon" />
            </div>
            <div className="boxAuth">
                <div className="navbarbox navAuth">
			        <img src={icon} className="buttonnav" alt="icon" />
    			    <p className="navTitle"> REGISTER </p>
                    <p className="navTitle"> ▷</p>
                </div>
                <div className='boxAuthContent'>
					<form className="registerForm" onSubmit={handleSubmit}>
						<label>Username:</label>
						<input
							className="registerInput"
							type="text"
							value={inputUsername}
							placeholder="toto"
							onChange={(e) => setInputUsername(e.target.value)} />
						<label>Password</label>
						<input
							className="registerInput"
							type="password"
							value={inputPassword}
							placeholder="********"
							onChange={(e) => setInputPassword(e.target.value)} />
						<label>E-mail:</label>
						<input
							className="registerInput"
							type="text"
							value={inputEmail}
							placeholder="toto@cie.io"
							onChange={(e) => setInputEmail(e.target.value)} />

						<button className="submitLogIn" type="submit">LET ME IN !</button>
					</form>
					<p> I changed my mind I want to be logged through 42 !</p>
					<button onClick={ Login }>LOG W/ 42</button>	
		        </div>
            </div>
        </div>
    )
}
