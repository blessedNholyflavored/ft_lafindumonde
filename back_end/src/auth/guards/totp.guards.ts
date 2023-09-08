import { Injectable, ExecutionContext } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TotpGuard {
	constructor(
		private readonly userService: UserService,
	){}

	async canActivate(context: ExecutionContext): Promise<any>{
		let user = undefined;
		switch(context.getType()){
			case "http" : {
				// console.log(context.switchToHttp().getRequest().user);
				user = context.switchToHttp().getRequest().user;
			}
			case "ws" : {
				user = context.switchToWs().getClient().user;
			}
		}
		// console.log(user, (user.enabled2FA == false || user.log2FA));
		//if (user.enabled2FA == true && user.log2FA == false)
		return user.enabled2FA == false || user.log2FA;
	}

}