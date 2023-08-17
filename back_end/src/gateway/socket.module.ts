import { Module } from '@nestjs/common';
import { MyGateway } from './socket.gateway';
import { GameService } from 'src/game/game.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [MyGateway, GameService, UserService],
})
export class GatewayModule {}
