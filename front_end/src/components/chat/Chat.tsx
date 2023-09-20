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
	const navigate = useNavigate();
	const socket = useContext(WebsocketContext);




	
	async function fetchPrivMessageList() {
		try {
		  const response = await fetch(`http://localhost:3001/chat/recupMess/${recipient}/${user?.id}`, {
			method: 'GET',
		  });
		  
		  if (!response.ok) {
			throw new Error('Erreur lors de la récupération des messages privés.');
		  }
		  
		  const data = await response.json();
	  
		  const usernamePromises = data.map(async (message: { senderId: any; recipientId: any; senderUsername: string; recipientUsername: string; }) => {
			try {
			  const senderResponse = await fetch(`http://localhost:3001/users/${message.senderId}/username`, {
				method: 'GET',
			  });
			  const recipientResponse = await fetch(`http://localhost:3001/users/${message.recipientId}/username`, {
				method: 'GET',
			  });
	  
			  if (senderResponse.ok && recipientResponse.ok) {
				const senderUsername = await senderResponse.text();
				const recipientUsername = await recipientResponse.text();
	  
				message.senderUsername = senderUsername;
				message.recipientUsername = recipientUsername;
			  }
			} catch (error) {
			  console.log(error);
			}
		  });
	  
		  // Attendez que toutes les promesses se terminent
		  await Promise.all(usernamePromises);
	  
		  // Mettez à jour la liste de messages avec les noms d'utilisateur
		  setMessageList(data);
	  
		  return data[0];
		} catch (error) {
		  console.error('Erreur :', error);
		  return [];
		}
	  }

	  async function fetchYourRoomsList() {
		
		try {
		  const response = await fetch(`http://localhost:3001/chat/recupYourRooms/${user?.id}`, {
			method: 'GET',
		  });
		  
		  if (!response.ok) {
			throw new Error('Erreur lors de la récupération des messages privés.');
		  }
		  
		  const data = await response.json();
		  if (data.length > 0) { 
			const friendObjects = data;
			const friendInfo = friendObjects.map((friend: {name:string; visibility:string;id:number; }) => ({
				name: friend.name,
				visibility: friend.visibility,
				id: friend.id
			}));
			setChannelsJoin(friendInfo);
		}
		}
		  catch (error) {
			console.error('Erreur :', error);
			return [];
		  }
		}

		useEffect(() => {
			async function fetchYourRooms() {
				  const scores = await fetchYourRoomsList();
			}
			fetchYourRooms();

		}, []);
	  

	  useEffect(() => {
		  async function fetchPrivMessage() {
			if (recipient)
			  {
          	const scores = await fetchPrivMessageList();
        	}

			}
			fetchPrivMessage();

			if (socket)
			{
				socket.on('refreshMessages', () => {
					fetchPrivMessage();
				}
	  )};
      }, []);

	const onSubmit = () => {
		if (value.length > 0)
		{
			socket.emit('newMessage', value, recipient);
			setTimeout(() => {
				socket.emit('reloadMessages', value, recipient);
			  }, 100);
		setValue('');
	  };}

	  const checkRoomAlreadyExist = async () => {
	
		try {
			const response = await fetch(`http://localhost:3001/chat/checkRoomName/${valueRoom}`, {
			  method: 'GET',
			});
			
			if (!response.ok) {
			  throw new Error('Erreur lors de la récupération des messages privés.');
			}
			
			const data = await response.json();

			return data;
			}
			catch (error) {
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
		navigate(`/chat/chan/${id}`);
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

	return (
		<div className="main_chat_box">
			<div>
			<ul>

<h1>Liste des channels join :</h1>
{channelsJoin.map((chan) => (

	<div>

<button onClick={() => navToChan(chan.id)}>
        <div>id: {chan.id} --- name chan: {chan.name} --- options: {chan.visibility}</div>
      </button>
  </div>
))}
</ul>
					{recipient && (
			<ul>
<h1>Liste des msgs envoyes :</h1>
{messageListSend.length > 0 && user ? (
messageListSend.map((friend, index) => (
	<div>
		{friend.recipientId === user?.id && (
			<div style={{backgroundColor:'red', float:'left'}}>
	<div key={index} >
		<div>{friend.start_at}</div>
		<div >{friend.senderUsername}</div>
		<div >{friend.content}</div>
		</div>
		</div>

		)}
			{friend.recipientId !== user?.id && (
			<div style={{backgroundColor:'green', float:'right'}}>
			<div key={index} >
			<div>{friend.start_at}</div>
			<div >{friend.senderUsername}</div>
			<div >{friend.content}</div>
			</div>
			</div>
	
			)}
			</div>
))
) : (
<div>pas de message</div>
)}
</ul>
)}
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
					<button className="logoutBtn" onClick={() => Logout({user, setUser})}>LOG OUT </button>
				</div>
				<div>
					{recipient && (
						<div>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button onClick={onSubmit}>Submit</button>
		  </div>
		  )}
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
		</div>
	);
};

export default Chat;