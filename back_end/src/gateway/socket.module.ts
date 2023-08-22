import { Module } from '@nestjs/common';
import { MyGateway } from './socket.gateway';
import { GameService } from 'src/game/game.service';
import { UserService } from 'src/user/user.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [MyGateway, GameService, UserService],
  imports: [AuthModule],
})
export class GatewayModule {}
