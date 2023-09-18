import { Socket } from 'socket.io';
//import { User } from 'src/interfaces';
import { User } from '@prisma/client';

// ici creation d'un type socket qui integre le user
// pour l'instant je reprends ton interface du coup
interface SocketWithUser extends Socket {
    user: User
}
export default SocketWithUser;