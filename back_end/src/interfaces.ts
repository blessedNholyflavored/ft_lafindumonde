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
    scorePlayer1: number;
    scorePlayer2: number;
    end: number;
  }


export interface Point {
  x: number;
  y: number;
}

export interface Ball {
  radius: number;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  speed: number;
}

  