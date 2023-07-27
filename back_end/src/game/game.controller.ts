// pong.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Controller('pong')
export class PongController {
  constructor(private userService: UserService) {}

  @Get('user/:username')
  async getUserByUsername(@Param('username') username: string) {
    try {
      const user = await this.userService.findUserByUsername(username);

      if (user) {
        return { username: user.username, id: user.id };
      } else {
        return { error: 'Utilisateur non trouvé' };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur :', error);
      return { error: 'Une erreur est survenue lors de la récupération de l\'utilisateur' };
    }
  }
}
