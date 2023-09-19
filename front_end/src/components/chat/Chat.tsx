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

export const Chat:React.FC = () => {
	const { user, setUser } = useAuth();
    const { recipient } = useParams();
	const [value, setValue] = useState('');
	const [messages, setMessages] = useState<MessagePayload[]>([]);
	const socket = useContext(WebsocketContext);
	const [messageListSend, setMessageList] = useState<messages[]>([]);

	
	async function fetchPrivMessageList() {
		try {
		  const response = await fetch(`http://localhost:3001/chat/recupMess/${recipient}/${user?.id}`, {
			method: 'GET',
		  });
		  
		  if (!response.ok) {
			throw new Error('Erreur lors de la récupération des messages privés.');
		  }
		  
		  const data = await response.json();
	  
		  // Créez un tableau de promesses pour récupérer les noms d'utilisateur en parallèle
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
	  
				// Ajoutez les noms d'utilisateur au message
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
	  

	  useEffect(() => {
		  async function fetchPrivMessage() {
		if (recipient)
			  {
          const scores = await fetchPrivMessageList();
        }
		  fetchPrivMessage();
	}
      }, []);

	const onSubmit = () => {
		if (value.length > 0)
			socket.emit('newMessage', value, recipient);
		setValue('');
	  };

	  const createRoom = () => {
		console.log(value);
		return '';
	  };
	return (
		<div className="main_chat_box">
			<div>
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
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button onClick={() => createRoom()}>nom de la room</button>
		  </div>
		</div>
	);
};

export default Chat;