import React, { useState } from 'react';
import "./../../App.css";
import "./../../style/Profile.css";
import "./../../style/Login.css";
import logo from "../../img/logo42.png";
import icon from "../../img/buttoncomp.png"
import { useAuth } from "./AuthProvider";
import { Login } from "./Login";
import { useNavigate } from 'react-router-dom';

export function LocalLogin () {
    const { user, setUser } = useAuth();
	const [inputUsername, setInputUsername] = useState('');
	const [inputPassword, setInputPassword] = useState('');
	const navigate = useNavigate();

    // si user a ete set (donc est log)
    // on peut acceder a Home
    if (user){
        navigate("/")
    }

    //on fait appel au service d'auth dans le back
    const handleSubmit = async(e: React.FormEvent) => {
		e.preventDefault();
		console.log("handle submit du login");
		fetch(`http://localhost:3001/auth/local_login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: inputUsername,
				password: inputPassword,
			}),
			credentials: "include",
		})
			.then(async (res: any) => {
				const data = await res.json();
				setUser(data.user);
				console.log("Ouii dans locallog:", data);
			})
			.catch((error:any) => {window.alert("Wrong Password or Username !");});
			//TODO: add control of response to check if it went right
    }

	const register = () => {
		navigate("/register");
	}
    return (
        <div className="Login">
            <div className="logoAuth">
		        <img src={logo} className="logo" alt="icon" />
            </div>
            <div className="boxAuth">
                <div className="navbarbox navAuth">
			        <img src={icon} className="buttonnav" alt="icon" />
    			    <p className="navTitle"> LOG IN </p>
                    <p className="navTitle"> ▷</p>
                </div>
                <div className='boxAuthContent'>
					<form className="loginForm" onSubmit={handleSubmit}>
						<label>Username:</label>
						<input
							className="loginInput"
							type="text"
							value={inputUsername}
							placeholder="toto"
							onChange={(e) => setInputUsername(e.target.value)} />
						<label>Password</label>
						<input
							className="passwordInput"
							type="password"
							value={inputPassword}
							placeholder="********"
							onChange={(e) => setInputPassword(e.target.value)} />
						<button className="submitLogIn" type="submit">LET ME IN !</button>
					</form>
					<p> I changed my mind I want to be logged through 42 !</p>
					<button onClick={ Login }>LOG W/ 42</button>	
					<p> I don't have any account ....</p>
					<button onClick={ register }>/REGISTER</button>
		        </div>
            </div>
        </div>
    )
}
