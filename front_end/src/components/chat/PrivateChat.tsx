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

export const PrivateChat = () => {
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
      const response = await fetch(`http://${window.location.hostname}:3000/chat/recupMess/${recipient}/${user?.id}`, {
            method: 'GET',
            credentials: 'include',
        });
      if (!response.ok) {
            throw new Error('Erreur lors de la récupération des messages privés.');
      }
      const data = await response.json();
      const usernamePromises = data.map(async (message: { senderId: any; recipientId: any; senderUsername: string; recipientUsername: string; }) => {
            try {
              const senderResponse = await fetch(`http://${window.location.hostname}:3000/users/${message.senderId}/username`, {
                    method: 'GET',
                    credentials: 'include',
              });
              const recipientResponse = await fetch(`http://${window.location.hostname}:3000/users/${message.recipientId}/username`, {
                    method: 'GET',
                    credentials: 'include',
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
      await Promise.all(usernamePromises);
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

    if (socket)
    {
        socket.on('refreshMessages', () => {
            fetchPrivMessage();
        }
)};
    }
    fetchPrivMessage();
}, []);

const onSubmit = () => {
    if (value.length > 0)
    {
        socket.emit('newMessage', value, recipient);
        setTimeout(() => {
            socket.emit('reloadMessages', value, recipient);
          }, 100);
        setValue('');
    };
}

return (

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
        </div>
        
);

}
export default PrivateChat;