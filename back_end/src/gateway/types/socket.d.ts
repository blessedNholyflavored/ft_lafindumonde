import { Socket } from 'socket.io';
import { User } from 'src/interfaces';

// ici creation d'un type socket qui integre le user
// pour l'instant je reprends ton interface du coup
export default interface SocketWithUser extends Socket {
    user: User
}