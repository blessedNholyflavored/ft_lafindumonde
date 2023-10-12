import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy){
	constructor(
		private readonly authService: AuthService,
		private readonly config: ConfigService,
	) {
		super({
			clientID: config.get('API_CLIENTID'), // adding env var that comes from 42 intra
			clientSecret: config.get('API_CLIENTSECRET'),
			callbackURL: String(`http://${process.env.HOSTNAME}:3000/auth/api/v1/auth/42/callback`),
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
		// getting infos from intra return
		const fortyTwoUser = {
			email: profile.emails[0].value,
			hash: "",
			username : profile.username,
			id: Number.parseInt(profile.id),
			pictureURL: profile._json.image.link,
		};
		// using service to check if user exists or create one
		const user = await this.authService.retrieveUser(fortyTwoUser);
		return user;
	}
}
