import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { AuthService } from './auth.service';
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
		const user = await this.userService.getUserByID(fortyTwoUser.id);
		if (!user){
			if (await this.userService.usernameAuthChecker(fortyTwoUser.username) == true){
				// in case someone already have this username
				fortyTwoUser.username = profile.username + '_';
			}
			return await this.userService.createUser(fortyTwoUser);
		}
		console.log('user id : ',user.id);
		console.log('profile: ', profile.id);
		return user;
	}
}
