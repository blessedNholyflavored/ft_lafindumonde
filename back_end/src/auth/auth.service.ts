import { Injectable, HttpException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
	constructor(private userService: UserService, private jwtService: JwtService){}

	async validateUser(username: string, password: string): Promise<User> {
		//const user = await this.userService.findUser();

	/*	if (user && user.password === password) {
			const {
				password,
				username,
				...rest
			} = user;
			return rest;
		}
		return null; 
		return user;*/
		throw new UnauthorizedException("Invalid credentials");
	}

	//ici faudra add 2FA boolean ds param
	async login(user: any) {
		console.log('in login from auth service !!!')
		const payload = {name: user.name, sub: user.id};

		return {
			access_token: this.jwtService.sign(payload),
			message: 'Success Login',
		};
	}
}
