import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
	constructor(config: ConfigService){
		super({
			jwtFromRequest: (req: any) => {
				var token = null;
				if (req && req.cookies) {
					token = req.cookies['access_token'];
				}
				console.log('hihihiihih:', req.cookies);
				return token;
			},
			ignoreExpiration: false,
			secretOrKey: config.get('JWT_SECURE_KEY'),
		})
	}

	async validate(payload: any){
		return {
			id: payload.sub,
			name: payload.name,
		};
	}
}
