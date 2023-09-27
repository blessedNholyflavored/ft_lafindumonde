import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { GameService } from './game/game.service';
import { GameModule } from './game/game.module';
import { GatewayModule } from './gateway/socket.module';
import { ChatModule } from './chat/chat.module';
// import { WebsocketProvider } from './gateway/socket.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
	  AuthModule,
    FriendsModule,
    GameModule,
    GatewayModule,
    ChatModule
	// ServeStaticModule.forRoot({
	// 	rootPath: join(__dirname, '..', 'back_end/uploads/'),
	// 	serveRoot: '/uploads',
	// }),
  ],
  providers: [PrismaService, UserService, GameService],
})
export class AppModule {}
