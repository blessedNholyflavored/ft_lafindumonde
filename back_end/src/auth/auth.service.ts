import { Injectable, HttpException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as cookie from 'cookie';
import { encode } from 'hi-base32';
import * as qrcode from 'qrcode';
import Socket from 'src/gateway/types/socket';
import { AuthDto } from 'src/user/dto/auth.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		private readonly config: ConfigService
	){}

	async login(user: any) {
		// JWT creation
		const payload = {sub: user.id};
		return {
			access_token: this.jwtService.sign(payload,{
				secret: this.config.get('JWT_SECURE_KEY'),
			}),
			message: 'Success Login',
		};
	}

	async retrieveUser(data: any){
		//check if user already exists, else user creation
		const user = await this.userService.getUserByID(data.id);
		if (!user){
			if (await this.userService.usernameAuthChecker(data.username) == true){
				// in case someone already have this username
				data.username =  data.username + '_';
			}
			return await this.userService.createUser(data, false);
		}
		return user;
	}

	keyGenerator(): string {
		//generates totpKey
		const buffer = crypto.randomBytes(20);
		const secret = encode(buffer);
		return secret;
	}

	async idGenerator(){
		// generates random ID for local login
		let idCreated = Math.floor(Math.random() * 99999);
		const userTest = await this.userService.getUserByID(idCreated);
		if (userTest){
			idCreated = await this.idGenerator();
		}
		return idCreated;
	}

	async generate2FAkey(user: any){
		// creates QR code from TotpKey generated
		// + add key to user
		const totpSecret = this.keyGenerator();
		const issuer =  'ft_lafindumonde';
		const qrCodeImg = await qrcode.toDataURL(`otpauth://totp/${issuer}:${user.id}?secret=${totpSecret}&issuer=${issuer}`);
		await this.userService.add2FAKey(totpSecret, user.id);
		return {qrCodeImg, user};
	}

	async getUserBySocket(socket: Socket) : Promise<User | undefined> {
		try {
			//gets user by cookie
			const token = socket.handshake.headers?.cookie?.split("; ")?.find((row) => row.startsWith("access_token"))?.split("=")[1];
			const payload = this.jwtService.verify(token, {secret: this.config.get('JWT_SECURE_KEY')});
			socket.user = await this.userService.getUserByID(payload.sub);
			return (socket.user);
		} catch (e) {
			return undefined;
		}
	}

	passwordChecker(input: string, user: User){
		return (bcrypt.compare(input, user.password));
	}

	async mailChecker(user: AuthDto): Promise<Boolean>{
		const tmpUser = await this.userService.getUserByEmail(user.email);
		if (tmpUser)
			return false;
		return (true);
	}

	async FortyTwoMailCheck(user: AuthDto) : Promise<Boolean>{
		const str = user.email.split('@').slice(1);

		if (str.includes('student.42.fr'))
			return false;
		return true;
	}
}
