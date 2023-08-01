import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PongController } from './game/game.controller';
import { PongGateway } from './game/game.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
	AuthModule,
  ],
  controllers: [AppController, PongController],
  providers: [PrismaService, UserService, AppService, PongGateway],
})
export class AppModule {}
