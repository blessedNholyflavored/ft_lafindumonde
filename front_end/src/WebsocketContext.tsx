import { createContext } from 'react';
import { io, Socket } from 'socket.io-client';

// ici add du withCredentials pour passer le token sans err de Cors
export const socket = io(`http://${window.location.hostname}:3000`, {withCredentials: true });
export const WebsocketContext = createContext<Socket>(socket);
export const WebsocketProvider = WebsocketContext.Provider;