import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { User } from './interfaces';
import icon from "./img/buttoncomp.png";
import logo from "./img/logo42.png";
import chat_pic from "./img/fill.pic.png";
import "./App.css";
import "./style/Home.css";
import "./style/Logout.css";
import { Logout } from './components/auth/Logout';
import { useAuth } from './components/auth/AuthProvider';

interface HomeProps {
  socket: Socket | null;
}

const Home: React.FC<HomeProps> = ({ socket }) => {
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState<number>(0);
  const { user, setUser } =useAuth();

  if (socket)
    console.log(socket.id);
  if (user)
    console.log(user.id);

  const handlePlayerSelect = async (player: string) => {
    setSelectedPlayer(player);

    try {
      // const response = await fetch(`http://localhost:3000/users/${player}`);
      // const user = await response.json();
      if (user)
      socket?.emit('joinQueue', user.id);
      setUser(user);

      socket?.on('queueUpdate', (count: number) => {
        setQueueCount(count);
        if (count === 2) {
         // socket?.emit('updateUserIG', user?.id);
          navigate('/game');
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'utilisateur :', error);
    }
  };


  const navigateToProfPage = () => {
    navigate('/settings');
  };

  const navigateToChat = () => {
	navigate('/chat');
  };

  return (
	<>
	<div className="main_box">
		<div className="navbarmainpage">
			<img src={icon} className="buttonnav" alt="icon" />
			<p className="titlemainpage"> TRANSCENDENCE </p>
		</div>
		<div className="home_box">
			{/* premier */}
			<div className="group_box hello_box">
				<div className="navbarsmallbox">
					<p className="boxtitle"> HOME </p>
				</div>
				<div className="home_img">
				</div>
			</div>
			{/* deuxieme */}
			<div className="group_box chat_box">
				<div className="navbarsmallbox">
					<p className="boxtitle"> CHAT WITH FRIENDS </p>
				</div>
				<div className="chat_btn">
					<button onClick={ navigateToChat }>Chat Now !</button>
				</div>
			</div>
			{/* troisieme */}
			<div className="group_box game_box">
				<div className="navbarsmallbox">
					<p className="boxtitle"> PLAY THE GAME </p>
				</div>
				<div className="game_img">
				    <button onClick={() => handlePlayerSelect('1')} className="game_img_btn">RECHERCHE DE PARTIE</button>
					<button onClick={navigateToProfPage} className="game_img_btn">Aller à la page Prof</button>
				    	{queueCount > 0 && (
    						<p>En attente d'autres joueurs...</p>
  						)}
  						{queueCount === 2 && (
    						<p>La partie commence entre Ldinaut et Mcouppe !</p>
  						)}
			    </div>
			</div>
			{/* quatrieme */}
			<div className="group_box achiev_box">
				<div className="navbarsmallbox">
					<p className="boxtitle"> 42 LOVES U </p>
				</div>
				<div className="achiev_img">
				</div>
			</div>
		</div>
		<div className="footer_box">
			<button className="logoutBtn" onClick={() => Logout({user, setUser})}>LOG OUT </button>
			<img src={logo} className="logo" alt="icon" />
		</div>
	</div>
	</>
  );/*
  return (
    <div>
      <h2>Les WebSocket c'est dla merde</h2>
      <button onClick={() => handlePlayerSelect('1')}>RECHERCHE DE PARTIE</button>
      <button onClick={navigateToProfPage}>Aller à la page Prof</button>

      {queueCount > 0 && (
        <p>En attente d'autres joueurs...</p>
      )}
      {queueCount === 2 && (
        <p>La partie commence entre Ldinaut et Mcouppe !</p>
      )}
	  		<div className="logoutBox">
			<button className="logoutBtn" onClick={() => Logout({user, setUser})}>LOG OUT </button>
		</div>
    </div>
  );*/
};

export default Home;
