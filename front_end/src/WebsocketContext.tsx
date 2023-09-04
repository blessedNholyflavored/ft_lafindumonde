import { createContext } from 'react';
import { io, Socket } from 'socket.io-client';

// ici add du withCredentials pour passer le token sans err de Cors
export const socket = io('http://localhost:3001', {withCredentials: true });
export const WebsocketContext = createContext<Socket>(socket);
export const WebsocketProvider = WebsocketContext.Provider;