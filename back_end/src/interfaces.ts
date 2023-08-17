export interface User {
    id?: number;
    username: string;
    point: Point;
    socketid: string;

  }
  
  export class Room {
    player1: User | null = null;
    player2: User | null = null;
    ball: Ball;
    idRoom: number;
    scorePlayer1: number;
    scorePlayer2: number;
    end: number;
    winner?: string;
    winnerid?: number;
    idP1?: number;
    idP2?: number;

  }

  export class roomSend {
    player1?: string;
    player2?: string;
    ballX?: number;
    ballY?: number;
    scoreP1?: number;
    scoreP2?: number;
    player1Y?: number;
    player2Y?: number;
    winner?: string;
    end?: number;
    roomID?: number;
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

  