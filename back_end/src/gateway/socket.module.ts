import { Module } from '@nestjs/common';
import { GameService } from 'src/game/game.service';
import { UserService } from 'src/user/user.service';
import { AuthModule } from 'src/auth/auth.module';
import { RoomMapService } from '../game/room_map.service';

@Module({
  providers: [GameService, UserService, RoomMapService],
  imports: [AuthModule],
})
export class GatewayModule {}
