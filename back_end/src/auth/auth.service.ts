import { Injectable, HttpException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private config: ConfigService
	){}

// local login
/*	async validateUser(username: string, password: string): Promise<User> {
		throw new UnauthorizedException("Invalid credentials");
	}*/

	//ici faudra add 2FA boolean ds param
	async login(user: any) {
		console.log('in login from auth service !!!')
		console.log('username is :', user.username);
		console.log('pictureURl is :', user.pictureURL);
		const payload = {name: user.name, sub: user.id};

		return {
			access_token: this.jwtService.sign(payload,{
				secret: this.config.get('JWT_SECURE_KEY'),
			}),
			message: 'Success Login',
		};
	}
}
