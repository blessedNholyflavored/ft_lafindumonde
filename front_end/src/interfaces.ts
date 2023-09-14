export interface User {
  id: number;
  username: string;
  point: Point;
  socketid: string;
}


  export class Room {
    player1?: string;
    player2?: string;
    ballX!: number;
    ballY!: number;
    scoreP1?: number;
    scoreP2?: number;
    player1Y!: number;
    player2Y!: number;
    winner?: string;
    end?: number;
    roomID?: number;
    speedX!: number;
    speedY!: number;
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
  