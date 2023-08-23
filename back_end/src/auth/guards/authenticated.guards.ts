import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { UserService } from 'src/user/user.service';


@Injectable()
export class AuthenticatedGuard implements CanActivate {
	constructor(
		private readonly config: ConfigService,
		private readonly jwt: JwtService,
		private readonly userService: UserService,
	){}

	async canActivate(context: ExecutionContext){
		switch(context.getType()) {
			case "http" : {
				const request =  context.switchToHttp().getRequest();
				return request.isAuthenticated();
			}
			case "ws" : {
				// on recupe la sock du client
				const socket = context.switchToWs().getClient();
				// on recupe le jwt qui est stock en cookie
				const token = socket.handshake.headers?.cookie
					?.split("; ")
					?.find((row) => row.startsWith("access_token"))
					?.split("=")[1];
				// petit console.log de test:
				console.log("client token is :", token);
				try {
					// on verif la signature du jwt --> est ce que le token est valide ?
					const payload = this.jwt.verify(token, {secret: this.config.get('JWT_SECURE_KEY')});
					socket.user = await this.userService.getUserByID(payload.sub) ?? {};
					return true;
				} catch (err) {
					throw new WsException('Unauthorized access');
				}
			}
		}
	}
}
