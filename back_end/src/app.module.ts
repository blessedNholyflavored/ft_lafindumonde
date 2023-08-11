import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    FriendsModule,
	// ServeStaticModule.forRoot({
	// 	rootPath: join(__dirname, '..', 'back_end/uploads/'),
	// 	serveRoot: '/uploads',
	// }),
  ],
  controllers: [AppController],
  providers: [PrismaService, UserService, AppService],
})
export class AppModule {}
