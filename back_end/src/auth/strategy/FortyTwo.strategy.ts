import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy){
	constructor(
		private readonly authService: AuthService,
		private config: ConfigService,
		private userService: UserService
	) {
		super({
			clientID: config.get('API_CLIENTID'), //env var
			clientSecret: config.get('API_CLIENTSECRET'), //env var
			callbackURL: String("http://localhost:3000/auth/api/v1/auth/42/callback"),
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
		const fortyTwoUser = {
			email: profile.emails[0].value,
			hash: "",
			username : profile.username,
			id: Number.parseInt(profile.id),
			pictureURL: profile._json.image.link,
		};
		const user = await this.authService.retrieveUser(fortyTwoUser);
		return user;
	}
}
