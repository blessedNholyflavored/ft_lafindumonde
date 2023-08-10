export interface User {
    id: number;
    username: string;
    point: Point;
    socketid: string;

  }
  
  export class Room {
    player1: User | null = null;
    player2: User | null = null;
    ball: Ball;
    idRoom: string;
  }


export interface Point {
  x: number;
  y: number;
}

export interface Ball {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  speed: number;
}

  