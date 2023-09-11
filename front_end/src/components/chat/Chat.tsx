import React from 'react';
import "./../../App.css";
import "./../../style/Chat.css";
import "./../../style/Logout.css";
import { useAuth } from "./../auth/AuthProvider";
import { Navigate } from 'react-router-dom';
import icon from "../../img/buttoncomp.png";
import logo from "../../img/logo42.png";
import { Logout } from './../auth/Logout';

export const Chat:React.FC = () => {
	const { user, setUser } = useAuth();

	return (
	 <div className="main_chat_box">
				<div className="chat_list">
						<div className="navbarmainpage nav_box">
							<img src={icon} className="buttonnav" alt="icon" />
							<p className="title_box">WHO'S ONLINE</p>
						</div>
				</div>
				<div className="message_box">
						<div className="navbarmainpage nav_box">
							<img src={icon} className="buttonnav" alt="icon" />
							<p className="title_box">CONV WITH m a c h i n</p>
						</div>
				</div>
				<div>
					<button className="logoutBtn" onClick={() => Logout({user, setUser})}>LOG OUT </button>
				</div>
		</div>
	);
};

export default Chat;