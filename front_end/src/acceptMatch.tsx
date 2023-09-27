import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "./App.css";
import "./style/Home.css";
import "./style/Logout.css";
import { Logout } from './components/auth/Logout';
import { useAuth } from './components/auth/AuthProvider';
import { WebsocketContext } from './WebsocketContext';

const AcceptMatch: React.FC = () => {

    const { id } = useParams();
    const { user, setUser } =useAuth();
    const navigate = useNavigate();
    const socket = useContext(WebsocketContext);

    if (socket)
    {
        socket.emit("matchAccepted", id);
    }
    if (socket)
    {
      socket?.on('matchStart', () => {
           socket?.emit('updateUserIG', user?.id);
            navigate('/gamefriend');
        
        });
      }

    return(
        <div></div>
    );

};

export default AcceptMatch;
