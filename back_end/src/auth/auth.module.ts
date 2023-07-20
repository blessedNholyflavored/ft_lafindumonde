import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { FortyTwoStrategy } from './FortyTwo.strategy';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserModule, PassportModule, ConfigModule.forRoot(), JwtModule.register({
		secret: process.env.JWT_SECURE_KEY, // => envvar
		signOptions: { expiresIn: '60s'},
  })],
  providers: [AuthService, FortyTwoStrategy, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
