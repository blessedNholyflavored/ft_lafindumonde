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
    interval?: any;

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
    speedX?: number;
    speedY?: number;
  }

  export class PosPlayerSend{
    player1Y?: number;
    player2Y?: number;
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

export interface Game {
	id: number;
	start_at: string;
	userId1: number;
	userId2: number;
	username1: string;
	username2: string;
	scrP1: number;
	scrP2: number;
  }

  export interface privateMessage {
    id: number;
    start_at: string;
    }

export interface Leaderboard {
	username: string;
	ELO: number;
	id: number;
	place: number;
}

export interface MiniScore {
  id: number;
  username: string;
  scoreMiniGame: number;
	place: number;

}
