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

interface messages {
	start_at: string;
    content: string;
	senderUsername: string;
	senderId: number;
    senderRole: string;
  }

export const ChatChannel = () => {

	const { user, setUser } = useAuth();
  const { id } = useParams();
	const [value, setValue] = useState('');
  const navigate = useNavigate();
	const socket = useContext(WebsocketContext);
	const [messageListSend, setMessageList] = useState<messages[]>([]);



  async function fetchRoomMessageList() {
		try {
		  const response = await fetch(`http://localhost:3000/chat/recupRoomMess/${id}`, {
			  method: 'GET',
        credentials: 'include',
		  });
		  
		  if (!response.ok) {
			  throw new Error('Erreur lors de la récupération des messages privés.');
		  }
		  
		  const data = await response.json();
      if (data.length > 0) { 
			  const friendObjects = data;
        const usernamePromises = data.map(async (message: { senderRole: string;senderId: any; senderUsername: string; }) => {
          try {
            const senderResponse = await fetch(`http://localhost:3000/users/${message.senderId}/username`, {
              method: 'GET',
             credentials: 'include',
            });
            const rolesenderResponse = await fetch(`http://localhost:3000/chat/getRole/${message.senderId}/${id}`, {
              method: 'GET',
              credentials: 'include',
            });
            if (senderResponse.ok && rolesenderResponse.ok) {
              const senderUsername = await senderResponse.text();
              const senderRole = await rolesenderResponse.text();
    
              message.senderUsername = senderUsername;
              message.senderRole = senderRole;
              console.log(message.senderRole);
            }

          }
          catch (error: any) {
            console.log(error);
          }
        });
        await Promise.all(usernamePromises);

			  setMessageList(data);
		  }
    }
    catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    async function fetchRoomMessage() {
      const scores = await fetchRoomMessageList();
    }
    fetchRoomMessage();
  }, []);


	const onSubmit = () => {
		if (value.length > 0)
      socket.emit('newMessageRoom', value, id);
		setValue('');
	};

  return (
    <div>
      <div>
        {id && (
			    <ul>
            <h1>Liste des msgs envoyes :</h1>
            {messageListSend.length > 0 && user ? (
              messageListSend.map((friend, index) => (
	              <div>
	              	{friend.senderId === user?.id && (
			            <div style={{backgroundColor:'blue', float:'left'}}>
	                <div key={index} >
		                <div>{friend.start_at}</div>
		                <div >{friend.senderUsername} --- {friend.senderRole}</div>
		                <div >{friend.content}</div>
		              </div>
		              </div>
		              )}
			            {friend.senderId !== user?.id && (
			            <div style={{backgroundColor:'green', float:'right'}}>
			            <div key={index} >
			              <div>{friend.start_at}</div>
			              <div >{friend.senderUsername}</div>
			              <div >{friend.content} --- {friend.senderRole}</div>
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
      {id && (
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
  );
}

export default ChatChannel;