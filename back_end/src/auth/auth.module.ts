import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { FortyTwoStrategy } from './strategy/FortyTwo.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthController} from './auth.controller';

@Module({
  imports: [UserModule, PassportModule, ConfigModule.forRoot(), JwtModule.register({
		secret: process.env.JWT_SECURE_KEY, // => envvar
		signOptions: { expiresIn: '1d'},
  })],
  providers: [AuthService, FortyTwoStrategy, JwtStrategy, JwtService],
  exports: [AuthService, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
