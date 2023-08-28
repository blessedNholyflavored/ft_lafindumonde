import { Controller, Get, Post, Redirect, Req, Res, Body, UseGuards, BadRequestException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { FortyTwoAuthGuard } from "./guards/FortyTwo-auth.guard";
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from "./guards/jwt-auth.guards";
import { AuthGuard } from "@nestjs/passport";
import { AuthenticatedGuard } from "./guards/authenticated.guards";

@Controller("auth")
export class AuthController{
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
	    private config: ConfigService,
    ){}

    /************************
     * 
     * 
     *                                  ROUTE TO CREATE FAKE USERS
     *      
     * 
     * *********************/
    /*****************************************/
	                    // TODO: suppr cette route pour la prod
    /*****************************************/

// pour creer le user : avec l'extension RESTED</> faire une requete post
// a http://localhost:3000/auth/test
// avec Content-Type /// application/json dans le Header
// et dans le Request Body, Type: JSON, faire et remplir les champs username, id et email (eventuellement pictureURL si on veut...

	@Post('test')
	async loginTest(@Body() body: {username: string, id: number, email: string}, @Res() res: any){
		if (!body.username || !body.id || !body.email){
			console.log(body);
			throw new BadRequestException("id, username or email is missing");
		}
		const user = await this.authService.retrieveUser(body);
		const token = await this.authService.login(user);
		res.cookie('access_token', token.access_token, {httpOnly: true}).json({user, token}).statusCode(200).send();

	}

    /************************
     * 
     * 
     *                                  LOGIN LOCAL (not available yet)
     *      
     * 
     * *********************/
    @Post('login')
    async login(@Body() loginDto:any){
        console.log('jsp gros');
        return ;
    }

    /************************
     * 
     * 
     *                                  LOGIN W/ 42
     *      
     * 
     * *********************/
    @Get('login42')
    @UseGuards(FortyTwoAuthGuard)
    async login42(){
    }

    @Get('/api/v1/auth/42/callback')
    @UseGuards(FortyTwoAuthGuard)
    async callback(@Req() req:any, @Res() res: any){
        const token = await this.authService.login(req.user);
        res.cookie('access_token', token.access_token, {httpOnly: true }).redirect('http://localhost:8080/');
        return token;
    }

    @Get('me')
    @UseGuards(AuthenticatedGuard)
    async protected(@Req() req: any) {
        return req.user;
    }

    /************************
     * 
     * 
     *                                  2FA ENABLER / DISABLER
     *      
     * 
     * *********************/
    // a update avec try catch if no user
    @Get('2FAenable')
    @UseGuards(JwtAuthGuard)
    async twoFAenabler(@Req() req: any){
        if (req.user.enabled2FA == true)
            console.log("2FA already enabled !");
        else {
            const updtUser = await this.userService.enable2FA(req.user.id);
            if (updtUser.enabled2FA == true)
                console.log("2FA correctly enabled !");
            else
                console.log("An issue happened enabling 2fa ???");
            return updtUser ;
        }
        return req.user;
    }

    @Get('2FAdisable')
    @UseGuards(JwtAuthGuard)
    async twoFAdisabler(@Req() req: any){
        if (req.user.enabled2FA == false)
            console.log("2FA is already disabled !");
        else {
            const updtUser = await this.userService.disable2FA(req.user.id);
            if (updtUser.enabled2FA == false)
                console.log("2FA correctly disabled !");
            else
                console.log("An issue happened disabling 2fa ???");
            return updtUser;
        }
        return req.user;
    }

    @Get('2FAtester')
    @UseGuards(JwtAuthGuard)
    async tester2FA(@Req() req:any){
        console.log("user here is :", req.user.username);
        if (req.user.enabled2FA == true)
           console.log("his 2fa is ENABLED !");
        else
            console.log("his 2fa is NOT enabled >< .....");
        
        const updtUser = await this.userService.enable2FA(req.user.id);
        
        console.log("user updated is :", updtUser.username);
        if (updtUser.enabled2FA == true)
            console.log("his 2fa is ENABLED !");
        else
            console.log("his 2fa is NOT enabled >< .....");
        return updtUser ;
    }

    /************************
     * 
     * 
     *                                  LOGOUT
     *      
     * 
     * *********************/
    @Get('logout')
    async   logout(@Res() res: any){
        res.clearCookie('access_token').status(200).send();
    }
}
