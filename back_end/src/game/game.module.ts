import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthModule } from 'src/auth/auth.module';
import { GameGateway } from './game.gateway';
import { RoomMapService } from './room_map.service';

@Module({
  imports: [AuthModule],
  controllers: [GameController],
  providers: [GameService, UserService, RoomMapService, GameGateway],
  exports: [GameService],
})
export class GameModule {}
