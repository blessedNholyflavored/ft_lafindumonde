import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from '@nestjs/passport';


@Injectable()
export class JwtGuard extends AuthGuard('jwt'){
	constructor(
		private readonly config: ConfigService,
		private readonly jwt: JwtService,
		private readonly userService: UserService,
	){
		super();
	}

	async canActivate(context: ExecutionContext): Promise<any>{
		switch(context.getType()) {
			case "http" : {
				return super.canActivate(context);
			}
			case "ws" : {
				// on recupe la sock du client
				const socket = context.switchToWs().getClient();
				// on recupe le jwt qui est stock en cookie
				const token = socket.handshake.headers?.cookie
					?.split("; ")
					?.find((row) => row.startsWith("access_token"))
					?.split("=")[1];
				try {
					// on verif la signature du jwt --> est ce que le token est valide ?
					const payload = this.jwt.verify(token, {secret: this.config.get('JWT_SECURE_KEY')});
					socket.user = await this.userService.getUserByID(payload.sub) ?? {};
					console.log("newttoie bien ta queuq");
					return true;
				} catch (err) {
					throw new WsException('Unauthorized access');
				}
			}
		}
	}
}
