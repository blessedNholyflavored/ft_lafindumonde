import { Module } from '@nestjs/common';
import { MyGateway } from './socket.gateway';
import { GameService } from 'src/game/game.service';

@Module({
  providers: [MyGateway, GameService],
})
export class GatewayModule {}
