export interface User {
    id: number;
    username: string;
  }
  
  export class Room {
    player1: User | null = null;
    player2: User | null = null;
  }
  