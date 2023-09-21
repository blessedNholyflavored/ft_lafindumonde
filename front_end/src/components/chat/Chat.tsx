import React, { useContext, useEffect, useState } from 'react';
import "./../../App.css";
import "./../../style/Chat.css";
import "./../../style/Logout.css";
import { useAuth } from "./../auth/AuthProvider";
import { Navigate, useParams } from 'react-router-dom';
import icon from "../../img/buttoncomp.png";
import logo from "../../img/logo42.png";
import { Logout } from './../auth/Logout';
import { WebsocketContext } from '../../WebsocketContext';
import { useNavigate } from 'react-router-dom';
import ChatChannel from './ChatChannel';
import PrivateChat from './PrivateChat';

type MessagePayload = {
  content: string;
  msg: string;
};

interface messages {
  start_at: string;
  content: string;
  recipientId: number;
  senderUsername: string;
  recipientUsername: string;
}

interface privMSG {
	id: number;
	username: string;
}

interface channels {
  name: string;
  visibility: string;
  id: number;
}

export const Chat = () => {
  const { user, setUser } = useAuth();
  const { recipient } = useParams();
  const [value, setValue] = useState('');
  const [valueRoom, setValueRoom] = useState('');
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [messageListSend, setMessageList] = useState<messages[]>([]);
  const [selectedOption, setSelectedOption] = useState('public');
  const [password, setPassword] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [channelsJoin, setChannelsJoin] = useState<channels[]>([]);
  const [privMSG, setPrivMSG] = useState<privMSG[]>([]);
  const [channels, setChannels] = useState<channels[]>([]);
  const [showChatChannel, setShowChatChannel] = useState(false);
  const [showConv, setShowConv] = useState(false);
  const [activeChannel, setActiveChannel] = useState<number | null>(null);
  const navigate = useNavigate();
  const socket = useContext(WebsocketContext);
  const [selectedPrivateConv, setSelectedPrivateConv] = useState<number | null>(null);
  const [isPrivateConvButtonDisabled, setIsPrivateConvButtonDisabled] = useState(false);

  async function fetchYourRoomsList() {
    try {
      const response = await fetch(`http://localhost:3000/chat/recupYourRooms/${user?.id}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des messages privés.');
      }
      const data = await response.json();
      if (data.length > 0) {
        const friendObjects = data;
        const friendInfo = friendObjects.map((friend: { name: string; visibility: string; id: number; }) => ({
          name: friend.name,
          visibility: friend.visibility,
          id: friend.id
        }));
        setChannelsJoin(friendInfo);
      }
    } catch (error) {
      console.error('Erreur :', error);
      return [];
    }
  }

  async function fetchRoomsList() {
    try {
      const response = await fetch(`http://localhost:3000/chat/recupRooms/${user?.id}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des messages preeeeivés.');
      }
      const data = await response.json();
      console.log(data);
      if (data.length > 0) {
        const friendObjects = data;
        const friendInfo = friendObjects.map((friend: { name: string; visibility: string; id: number; }) => ({
          name: friend.name,
          visibility: friend.visibility,
          id: friend.id
        }));
        setChannels(friendInfo);
      }
    } catch (error) {
      console.error('Erreur :', error);
      return [];
    }
  }

  async function fetchUsernameById(userId: string) {
	try {
	  const response = await fetch(`http://localhost:3000/users/${user?.id}/username`, {
		method: 'GET',
		credentials: 'include',
	  });
	  if (!response.ok) {
		throw new Error(`Erreur lors de la récupération de l'utilisateur avec l'ID ${userId}.`);
	  }
	  const userData = await response.text();
	  return userData;
	} catch (error) {
	  console.error('Erreur :', error);
	  return null; // En cas d'erreur, renvoyez null ou une valeur par défaut
	}
  }

  async function fetchPrivateConvList() {
    try {
      const response = await fetch(`http://localhost:3000/chat/recupPrivate/${user?.id}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des messages preeeeivés.');
      }
	  const data = await response.json();

	  if (data.length > 0) {
		const promises = data.map(async (userId: string) => {
		  const username = await fetchUsernameById(userId);
		  return { id: userId, username };
		});
  
		const usernames: privMSG[] = await Promise.all(promises);
		setPrivMSG(usernames);
	  }
    } catch (error) {
      console.error('Erreur :', error);
      return [];
    }
  }

  useEffect(() => {
    async function fetchYourRooms() {
      const scores = await fetchYourRoomsList();
    }
    async function fetchRooms() {
      const scores = await fetchRoomsList();
    }
	async function fetchPrivateConv() {
		const scores = await fetchPrivateConvList();
	  }

    fetchYourRooms();
    fetchRooms();
	fetchPrivateConv();
  }, []);

  const checkRoomAlreadyExist = async () => {
    try {
      const response = await fetch(`http://localhost:3000/chat/checkRoomName/${valueRoom}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des messages privés.');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur :', error);
      return [];
    }
  }

  const createRoom = async () => {
    if (await checkRoomAlreadyExist() === false)
      socket.emit("createChatRoom", valueRoom, selectedOption, password);
    else
      alert("Name room already taken");
    return '';
  };

  const joinRoom = async () => {
    if (await checkRoomAlreadyExist() === true)
      socket.emit("joinChatRoom", valueRoom, selectedOption, password);
    else
      alert("room existe po");
    return '';
  };

  const navToChan = (id: number) => {
    setActiveChannel(id);
    navigate(`/chat/chan/${id}`);
  }

  const navToPrivateConv = (id: number) => {
	setSelectedPrivateConv(id);
    navigate(`/chat/priv/${id}`);
  }

  const clickToJoinChan = (id: number, name: string, option: string) => {
    if (option === "PUBLIC") {
      socket.emit("joinChatRoom", name, option, '');
    } else if (option === "PWD_PROTECTED") {
      const password = window.prompt("Entrez le mot de passe :");

      if (password !== null) {
        socket.emit("joinChatRoom", name, option, password);
      } else {
        alert("Annulation : Vous devez fournir un mot de passe pour rejoindre le channel protégé.");
      }
    }
  }

  const handleOptionChange = (e: { target: { value: string; }; }) => {
    setSelectedOption(e.target.value);
    if (e.target.value !== 'protected') {
      setPassword('');
    }
  };

  const handleInputChange = (e: { target: { value: string; }; }) => {
    setValueRoom(e.target.value);
    setIsButtonDisabled(e.target.value === '');
  };

  const handleButton = () => {
    setShowChatChannel(false);
	setTimeout(() => {
		setShowChatChannel(true);
		setShowConv(false);
		setSelectedPrivateConv(0);
	}, 100);
  };

  const handleButtonConv = () => {
	setShowConv(false);
	setTimeout(() => {
		setShowConv(true);
		setShowChatChannel(false);
		setActiveChannel(0);
	}, 100);
  };

  return (
    <div className="main_chat_box">
      <div>
        <ul>
          <h1>Liste des channels disponible :</h1>
          {channels.map((chan) => (
            <div key={chan.id}>
              <button
                onClick={() => clickToJoinChan(chan.id, chan.name, chan.visibility)}
                disabled={activeChannel === chan.id} // Désactivez le bouton si c'est le canal actif
              >
                <div>id: {chan.id} --- name chan: {chan.name} --- options: {chan.visibility}</div>
              </button>
            </div>
          ))}
        </ul>

      </div>
	  <div>
      <ul>
        <h1>Liste des convos privées :</h1>
        {privMSG.map((priv) => (
          <div key={priv.id}>
            <button
              onClick={() => {
                navToPrivateConv(priv.id);
				if (showConv) {
					handleButtonConv();
				} else {
					setShowConv(true);
					setShowChatChannel(false);
					setActiveChannel(0);
				}
              }}
              disabled={selectedPrivateConv === priv.id}
            >
              <div>id: {priv.id} --- username: {priv.username}</div>
            </button>
          </div>
        ))}
      </ul>
    </div>
      <div>
        <ul>
          <h1>Liste des channels join :</h1>
          {channelsJoin.map((chan) => (
            <div key={chan.id}>
              <button
                onClick={() => {
                  navToChan(chan.id);
                  if (showChatChannel) {
                    handleButton();
                  } else {
                    setShowChatChannel(true);
					setShowConv(false);
					setSelectedPrivateConv(0);
                  }
                }}
                disabled={activeChannel === chan.id}
              >
                <div>id: {chan.id} --- name chan: {chan.name} --- options: {chan.visibility}</div>
              </button>
            </div>
          ))}
        </ul>
      </div>
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
        <button className="logoutBtn" onClick={() => Logout({ user, setUser })}>LOG OUT </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Nom de la room"
          value={valueRoom}
          onChange={handleInputChange}
        />
        <select
          value={selectedOption}
          onChange={handleOptionChange}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="protected">Protected</option>
        </select>
        {selectedOption === 'protected' && (
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        <button onClick={createRoom} disabled={isButtonDisabled}>
          Créer une nouvelle room
        </button>
        <button onClick={joinRoom} disabled={isButtonDisabled}>
          Rejoindre une room existante
        </button>
      </div>
      {showChatChannel && (
		<ChatChannel />
	  )}
	{showConv && (
		<PrivateChat />
	)}
    </div>
  );
};

export default Chat;
