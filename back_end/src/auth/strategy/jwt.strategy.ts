import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
	constructor(
		private readonly config: ConfigService,
		private readonly userService: UserService
	){
		super({
			jwtFromRequest: (req: any) => {
				var token = null;
				if (req && req.cookies) {
					token = req.cookies['access_token'];
				}
				return token;
			},
			ignoreExpiration: false,
			secretOrKey: config.get('JWT_SECURE_KEY'),
		})
	}

	async validate(payload: any){
		return await this.userService.getUserByID(payload.sub);
	}
}
