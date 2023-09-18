import { Injectable, HttpException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as cookie from 'cookie';
import { encode } from 'hi-base32';
import * as qrcode from 'qrcode';
import { User } from '@prisma/client';
import Socket from 'src/gateway/types/socket';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private config: ConfigService
	){}

	async login(user: any) {
		const payload = {sub: user.id};
		return {
			access_token: this.jwtService.sign(payload,{
				secret: this.config.get('JWT_SECURE_KEY'),
			}),
			message: 'Success Login',
		};
	}

	async retrieveUser(data: any){
		const user = await this.userService.getUserByID(data.id);
		if (!user){
		// TODO: check what happens if data is empty
			if (await this.userService.usernameAuthChecker(data.username) == true){
				// in case someone already have this username
				data.username =  data.username + '_';
			}
			return await this.userService.createUser(data);
		}
		return user;
	}

	keyGenerator(): string {
		const buffer = crypto.randomBytes(20);
		const secret = encode(buffer);
		return secret;
	}

	idGenerator(){
		const test = Math.floor(Math.random() * 99999);
		return test;
	}

	async generate2FAkey(user: any){
		const totpSecret = this.keyGenerator();
		// TODO: find a better name
		const issuer =  'AwesomeLameApp';
		const qrCodeImg = await qrcode.toDataURL(`otpauth://totp/${issuer}:${user.id}?secret=${totpSecret}&issuer=${issuer}`);
		await this.userService.add2FAKey(totpSecret, user.id);
		return {qrCodeImg, user};
	}

	async getUserBySocket(socket: Socket) : Promise<User | undefined> {
		try {
			const token = cookie.parse(socket.handshake.headers?.cookie)['access_token'];
			const payload = this.jwtService.verify(token, {secret: this.config.get('JWT_SECRET')});
			socket.user = await this.userService.getUserByID(payload.sub);
			return (socket.user);
		} catch {
			return undefined;
		}
	}

	async passwordChecker(input: string, user: User){
		console.log("input :", input);
		console.log("user.password:", user.password);
		if (user.password === input)
			return true;
		else
			return false;
	}
}
