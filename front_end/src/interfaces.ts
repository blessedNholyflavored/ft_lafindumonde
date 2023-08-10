export interface User {
  id: number;
  username: string;
  point: Point;
}


  export class Room {
    player1: User | null = null;
    player2: User | null = null;
    ball: Point | undefined;
  }

  export interface Point {
    x: number;
    y: number;
  }
  