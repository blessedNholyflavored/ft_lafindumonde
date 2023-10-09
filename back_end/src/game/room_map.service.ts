import { Injectable } from '@nestjs/common';
import { Room } from '../interfaces'; // Assurez-vous d'importer le modèle de salle correctement

@Injectable()
export class RoomMapService {
  private roomMap: Record<string, Room> = {};

  addRoom(id: string, room: Room): void {
    this.roomMap[id] = room;
  }

  getRoom(id: string): Room {
    return this.roomMap[id];
  }

  removeRoom(id: string): void {
    delete this.roomMap[id];
  }
}
