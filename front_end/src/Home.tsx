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
import folder from "./img/folder0.png";
import folder1 from "./img/folder2.png";
import folder2 from "./img/folder3.png";
import folder3 from "./img/folder4.png";
import folder4 from "./img/folder5.png";
import nav from "./img/buttoncomp.png"
import gaming from "./img/gamingpreview.png"
import love from "./img/42lov.png"
import chatpic from "./img/chatpic.png"
import gradient from "./img/gradient.png"
import Notify from './Notify';


interface HomeProps {
  socket: Socket | null;
}

const Home: React.FC<HomeProps> = () => {
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [queueCountBonus, setQueueCountBonus] = useState<number>(0);
  const [notifyMSG, setNotifyMSG] = useState<string>('');
  const [notifyType, setNotifyType] = useState<number>(0);
  const [sender, setSender] = useState<number>(0);
  const socket = useContext(WebsocketContext);

  const { user, setUser } =useAuth();
  // const [recupStatus, setStatus] = useState<string>('');
  let recupStatus = '';
  const [inGame, setInGame] = useState<number>(0);
	let [ImgUrl, setImgUrl] = useState<string>('');
  const [showNotification, setShowNotification] = useState(false);


  useEffect(() => {
		displayPic();
	}, []);
	

  const displayPic = async() => {

		const userId = user?.id;
		try {
			const response = await fetch(`http://localhost:3001/users/${userId}/avatar`, {
				method: 'GET',
			});
			if (response.ok) {
				const pictureURL = await response.text();
				//console.log("aaaaaaA",pictureURL);
				if (pictureURL.includes("https"))
				{
					setImgUrl(pictureURL);
				}
				else {
					try {
					const response = await fetch(`http://localhost:3001/users/uploads/${pictureURL}`, {
						method: 'GET',
					});
					if (response.ok) {
						const blob = await response.blob();
						const absoluteURL = URL.createObjectURL(blob);
						setImgUrl(absoluteURL);
					}
					}
					catch (error) {
						console.error(error);
					}
				}
			}
		}
		catch (error) {
			console.error(error);
		}
	}

  const handlePlayerSelect = async (player: string) => {
    setSelectedPlayer(player);

    try {
      const response = await fetch(`http://localhost:3000/users/status/${user?.id}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const recup = await response.text();
        // setStatus(recup);
        recupStatus = recup;
        console.log("ICICICICICICIC", recupStatus);
      }
      if (recupStatus !== "INGAME")
      {
      if (user)
      socket?.emit('joinQueue', user.id, 0);
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

if (socket)
{
  socket.on("coucou", () => {
    socket.emit("coucou");
  })
}

if (socket)
{
  socket.on("friendShipNotif", () => {
    setShowNotification(true);
    setNotifyMSG("Tu as recu une demande d'ami")
    setNotifyType(0);
  })
}

if (socket)
{
  socket.on("receiveInvite", (sender: number) => {
    setShowNotification(true);
    setNotifyMSG("Tu as recu une invitation pour une partie")
    setNotifyType(1);
    setSender(sender);
  })
}


const handlePlayerSelect222 = async (player: string) => {
  setSelectedPlayer(player);


  try {
      if (user)
    socket?.emit('joinQueue', user.id, 1);
    setUser(user);

    socket?.on('queueUpdateBonus', (count: number) => {
      setQueueCountBonus(count);
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
    navigate(`/users/profile/${user?.id}`);
  };

  const navigateToChat = () => {
	navigate('/chat');
  };

  const NavToSoloPong = () => {
    navigate('/solopong');
    };

  const navigateToFriends = () => {
    navigate('/friends');
    };

    const handleCloseNotification = () => {
      setShowNotification(false);
    };


  const navigateToSettings = () => {
    navigate('/settings');
    };


  return (
	<>
  <body>
    <header>
        <div>
            <img src={nav} alt="Menu 1"/>
        </div>
        <h1>TRANSCENDENCE</h1>
    </header>
    <div>
      {showNotification && (
        <Notify message={notifyMSG} type={notifyType} senderId={sender} onClose={handleCloseNotification} />
      )}
    </div>
    <div className="flex-bg">
        <main>
            <div className="home">
					<p> HOME </p>
          <div className="inside">
            <img src={ImgUrl} className="homepic"/>
                <button className="homebut">
              WELCOME {user?.username}
                </button>
              </div>
            </div>
            
            <div className="chat"onClick={ navigateToChat } >
					<p> CHAT WITH FRIENDS </p>
          <img src={chatpic} />
            </div>

            <div className="troll" >
					<p > 42 LOVES U </p>
          <img src={love} />

            </div>

            <div className="game" onClick={() => handlePlayerSelect('1')} >
					<p> PLAY THE GAME </p>
          <img src={gaming} />
            </div>
            
        </main>
        <nav>
            <ul>
                <li className="menu-item">
                    <a onClick={() => handlePlayerSelect('1')}>
                        <img src={folder4} alt="Menu 1"/>
                        <p  >Matchmaking</p>
                       {(queueCount > 0 || queueCountBonus > 0) &&  (
    						<p>En attente d'autres joueurs...</p>
  						)}
  						{queueCount === 2 && (
    						<p>La partie commence entre Ldinaut et Mcouppe !</p>
  						)}
              { inGame === 1 && (
                <p>Deja en game mon reuf !</p>
              )}
                    </a>
                </li>
                <li className="menu-item">
                    <a onClick={() => handlePlayerSelect222('1')}>
                        <img src={folder3} alt="Menu 2"/>
                        <p  >Big Game</p>
                        
                    </a>
                </li>
                <li className="menu-item">
                    <a onClick={() => NavToSoloPong()}>
                        <img src={folder2} alt="Menu 3"/>
                        <p  >Tiny Game</p>
                    </a>
                </li>
                <li className="menu-item">
                    <a onClick={navigateToProfPage}>
                        <img src={folder1} alt="Menu 3"/>
                        <p >Profile</p>
                    </a>
                </li>
                <li className="menu-item">
                    <a onClick={navigateToSettings}>
                        <img src={folder} alt="Menu 3"/>
                        <p  >Settings</p>
                    </a>
                    
                </li>
            </ul>
        </nav>
    </div>
    <footer>
        <button className="logoutBtn" onClick={() => Logout({user, setUser})}>LOG OUT </button>
			<img src={logo} className="logo" alt="icon" />
    </footer>
</body>



	{/* <div className="main_box">
		<div className="navbarmainpage">
			<img src={icon} className="buttonnav" alt="icon" />
			<p className="titlemainpage"> TRANSCENDENCE </p>
		</div>
		<div className="home_box">
			<div className="group_box hello_box">
				<div className="navbarsmallbox">
					<p className="boxtitle"> HOME </p>
				</div>
				<div className="home_img">
				</div>
			</div>
			<div className="group_box chat_box">
				<div className="navbarsmallbox">
					<p className="boxtitle"> CHAT WITH FRIENDS </p>
				</div>
				<div className="chat_btn">
					<button onClick={ navigateToChat }>Chat Now !</button>
				</div>
			</div>
      <div className="group_box chat_box">
				<div className="navbarsmallbox">
					<p className="boxtitle"> FRIENDS </p>
				</div>
				<div className="chat_btn">
					<button onClick={ navigateToFriends }>Friends !</button>
				</div>
			</div>
			<div className="group_box game_box">
				<div className="navbarsmallbox">
					<p className="boxtitle"> PLAY THE GAME </p>
				</div>
				<div className="game_img">
				    <button onClick={() => handlePlayerSelect('1')} className="game_img_btn">RECHERCHE DE PARTIE</button>
				    <button onClick={() => handlePlayerSelect222('1')} className="game_img_btn">RECHERCHE DE SUPER PARTIE</button>
				    <button onClick={() => NavToSoloPong()} className="game_img_btn">Mini Jeu</button>
					<button onClick={navigateToProfPage} className="game_img_btn">My Profile</button>
				    	{(queueCount > 0 || queueCountBonus > 0) &&  (
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
	</div> */}
	
  
  
  </>
  );
};

export default Home;


/*
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