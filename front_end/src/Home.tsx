import React, { useContext, useEffect, useState } from 'react';
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
import { WebsocketContext } from './WebsocketContext';


interface HomeProps {
  socket: Socket | null;
}

const Home: React.FC<HomeProps> = () => {
  const navigate = useNavigate();
  const socket = useContext(WebsocketContext);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState<number>(0);
  const { user, setUser } =useAuth();
  // const [recupStatus, setStatus] = useState<string>('');
  let recupStatus = '';
  const [inGame, setInGame] = useState<number>(0);


  const handlePlayerSelect = async (player: string) => {
    setSelectedPlayer(player);

    try {
      const response = await fetch(`http://localhost:3001/users/status/${user?.id}`, {
        method: 'GET',
      });
      if (response.ok) {
        const recup = await response.text();
        // setStatus(recup);
        recupStatus = recup;
        console.log(recupStatus);
      }
      if (recupStatus !== "INGAME")
      {
      if (user)
      socket?.emit('joinQueue', user.id);
      setUser(user);

      socket?.on('queueUpdate', (count: number) => {
        setQueueCount(count);
        if (count === 2) {
         socket?.emit('updateUserIG', user?.id);
          navigate('/game');
        }
      
      });
    }
    else if (recupStatus === "INGAME")
    {
      setInGame(1);
    }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'utilisateur :', error);
    }

    return () => {
      if (socket) {
        socket.off('queueUpdate');
      }
    };
}


const handlePlayerSelect222 = async (player: string) => {
  setSelectedPlayer(player);


  try {
      if (user)
    socket?.emit('joinQueue', user.id);
    setUser(user);

    socket?.on('queueUpdate', (count: number) => {
      setQueueCount(count);
      if (count === 2) {
       socket?.emit('updateUserIG', user?.id);
        navigate('/SuperGame');
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'utilisateur :', error);
  }

  return () => {
    if (socket) {
      socket.off('queueUpdate');
    }
  };
}


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
              { inGame === 1 && (
                <p>Deja en game mon reuf !</p>
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
      <button onClick={() => handlePlayerSelect222('1')}>Rdfsfvdsvfdsvfdfd</button>


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
