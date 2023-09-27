import { Injectable, ExecutionContext } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TotpGuard {
	constructor(
		private readonly userService: UserService,
	){
		console.log("in Authenticated Guard==> totpGuard !");
	}

	async canActivate(context: ExecutionContext): Promise<any>{
		let user = undefined;
		switch(context.getType()){
			case "http" : {
				user = context.switchToHttp().getRequest().user;
			}
			case "ws" : {
				user = context.switchToWs().getClient().user;
			}
		}
		return user.enabled2FA == false || user.log2FA;
	}
}