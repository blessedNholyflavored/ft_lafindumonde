import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy){
	constructor(private authService: AuthService, config: ConfigService) {
		super({
			clientID: config.get('API_CLIENTID'), //env var
			clientSecret: config.get('API_CLIENTSECRET'), //env var
			callbackURL: "http://127.0.0.1:3000/auth/42/callback"
		});
	}

	async validate(username: string, password: string): Promise<any> {
		const user =  await this.authService.validateUser(username, password);

		if (!user){
			throw new UnauthorizedException();
		}

		return user;
	}
}
