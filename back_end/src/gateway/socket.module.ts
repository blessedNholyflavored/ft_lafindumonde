import { Module } from '@nestjs/common';
import { MyGateway } from './socket.gateway';
import { GameService } from 'src/game/game.service';
import { UserService } from 'src/user/user.service';
import { AuthModule } from 'src/auth/auth.module';
import { RoomMapService } from './room_map.service';

@Module({
  providers: [MyGateway, GameService, UserService, RoomMapService],
  imports: [AuthModule],
})
export class GatewayModule {}
