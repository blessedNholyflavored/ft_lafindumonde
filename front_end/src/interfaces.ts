export interface User {
  id: number;
  username: string;
  point: Point;
  socketid: string;
}


  export class Room {
    player1: User | null = null;
    player2: User | null = null;
    ball: Ball | undefined;
    scorePlayer1!: number | 0;
    scorePlayer2!: number | 0;
    end!: number;
    winner?: string;
    winnerid?: number;
    idRoom?: number;
    idP1?: number;
    idP2?: number;



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
  