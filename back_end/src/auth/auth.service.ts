import { Injectable, HttpException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { encode } from 'hi-base32';
import * as qrcode from 'qrcode';

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
		const payload = {sub: user.id};
	/*	if (await this.launch2FA(user) == false) {
			return {
				access_token:'access failed',
				message: 'Authentication with 2FA failed'
			}
		}*/
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
	//	console.log("DEBUGDEBUG buffer from crypto = ", buffer);
		const secret = encode(buffer);
	//	console.log("DEBUGDEBUGDEBUG buffer encoded in b32 : ", secret);
		return secret;
	}

	async generate2FAkey(user: any){
		const totpSecret = this.keyGenerator();

		//console.log("COUCOUCOCOUC TOTP SECRET: ", totpSecret);
		// generate QR code
		const issuer =  'AwesomeLameApp';
		const qrCodeImg = await qrcode.toDataURL(`otpauth://totp/${issuer}:${user.id}?secret=${totpSecret}&issuer=${issuer}`);
		await this.userService.add2FAKey(totpSecret, user.id);

		return {qrCodeImg, user};
	}
/*	async launch2FA(user: any){
		if (user.enabled2FA == false)
			return true;
		
	}*/
}
