// backend/src/game/game.controller.ts

import { Controller } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
@Controller() // Add the @Controller() decorator here
export class PongController implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('startGame')
  handleStartGame(client: any, payload: any) {
    // Traitez le démarrage du jeu ici
    // Vous pouvez initialiser l'état du jeu et envoyer des informations aux deux joueurs pour démarrer le jeu.
  }

  @SubscribeMessage('updatePaddle')
  handleUpdatePaddle(client: any, payload: any) {
    // Gérez les mises à jour des raquettes des joueurs ici
    // Les joueurs enverront leurs positions de raquette via ce message
    // Vous pouvez mettre à jour l'état du jeu en conséquence.
  }

  // Méthode appelée lorsqu'un joueur se connecte
  handleConnection(client: any, ...args: any[]) {
    // Traitez la connexion du joueur ici
    // Vous pouvez attribuer un identifiant unique au joueur et le préparer pour le jeu.
  }

  // Méthode appelée lorsqu'un joueur se déconnecte
  handleDisconnect(client: any) {
    // Traitez la déconnexion du joueur ici
    // Vous pouvez gérer la fin du jeu ou l'arrêt de la partie en cas de déconnexion.
  }
}
