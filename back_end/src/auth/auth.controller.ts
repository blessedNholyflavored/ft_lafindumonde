import { Controller, Get, Post, Redirect, Req, Res, Body, UseGuards, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
//TODO: careful aux .guardSSSS
import { FortyTwoAuthGuard } from "./guards/FortyTwo-auth.guard";
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from "@nestjs/passport";
import { AuthenticatedGuard } from "./guards/authenticated.guards";
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';

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
		res.cookie('access_token', token.access_token, {httpOnly: true}).json({user: this.userService.exclude(user, ['totpKey']), token}).statusCode(200).send();

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
		await this.userService.setLog2FA(req.user, false);
        res.cookie('access_token', token.access_token, {httpOnly: true }).redirect('http://localhost:8080/');
        return token;
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    async protected(@Req() req: any) {
        return this.userService.exclude(req.user, ['totpKey']);
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
    @UseGuards(...AuthenticatedGuard)
    async twoFAenabler(@Req() req: any, @Res() res: any){
        // resetting 2FA in case 2FA is already enabled
        if (req.user.enabled2FA == true){
            await this.userService.disable2FA(req.user.id);
        }
        const { qrCodeImg, user } = await this.authService.generate2FAkey(req.user);
            // here --> redirect user to a page with a generated QR code made with the secret 2fa key made for him
            // he will have to scan the code to get second auth code. If and only IF everything here went well,
            // we enable his 2FA by setting enabled2FA to true
      //  return res.redirect(`http://localhost:8080//totpSave?qrCodeImg=${encodeURIComponent(qrCodeImg)}&userId=${user.id}`);
        return res.json({code: qrCodeImg});
      /*  if (updtUser.enabled2FA == true){
                console.log("2FA correctly enabled !");
                return updtUser;
        } else {
                console.log("An issue happened enabling 2fa ???");
        }*/
        //return req.user;
    }

    @Get('2FAdisable')
    @UseGuards(...AuthenticatedGuard)
    async twoFAdisabler(@Req() req: any){
        if (req.user.enabled2FA == false)
            console.log("2FA is already disabled !");
        else {
            const updtUser = await this.userService.disable2FA(req.user.id);
			await this.userService.setLog2FA(updtUser, false);
            if (updtUser.enabled2FA == false)
                console.log("2FA correctly disabled !");
            else
                console.log("An issue happened disabling 2fa ???");
            return this.userService.exclude(updtUser, ['totpKey']);
        }
        return this.userService.exclude(req.user, ['totpKey']);
    }

    // @Get('2FAtester')
    // @UseGuards(...AuthenticatedGuard)
    // async tester2FA(@Req() req:any){
    //     console.log("user here is :", req.user.username);
    //     if (req.user.enabled2FA == true)
    //        console.log("his 2fa is ENABLED !");
    //     else
    //         console.log("his 2fa is NOT enabled >< .....");
        
    //     const updtUser = await this.userService.enable2FA(req.user.id);
        
    //     console.log("user updated is :", updtUser.username);
    //     if (updtUser.enabled2FA == true)
    //         console.log("his 2fa is ENABLED !");
    //     else
    //         console.log("his 2fa is NOT enabled >< .....");
    //     return this.userService.exclude(updtUser, ['totpKey']);
    // }

    /************************
     * 
     * 
     *                                  2FA FRONT PART
     *      
     * 
     * *********************/

    @Post('submitCode')
    @UseGuards(AuthGuard('jwt'), AuthGuard('totp'))
    async codeChecker(@Req() req: any, @Res() res: any, @Body() body: {userInput: string, userID: number}){
        // console.log("SALUT SALUT SALUT OPUTDJSHFJKU");
        /*if (!body.userInput || !body.userID){
            console.log(body);
            throw new BadRequestException("input is missing or user is invalid");
        }*/
        const user = await this.userService.getUserByID(req.user.id);
        await this.userService.enable2FA(user.id);
		await this.userService.setLog2FA(user, true);
        return res.status(200).json(this.userService.exclude(user, ['totpKey']));
    }

	// submit input during auth login
	@Post('submitInput')
	@UseGuards(AuthGuard('jwt'), AuthGuard('totp'))
	async inputChecker(@Req() req: any, @Res() res: any, @Body() body: {userInput: string, userID: number}){
		// console.log('inside submitInput controller');
		const user = await this.userService.getUserByID(req.user.id);
		//set user.log2FA a true
		const updtUser = await this.userService.setLog2FA(user, true);
		return res.status(200).json(this.userService.exclude(updtUser, ['totpKey']));
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
		// console.log("")
        res.clearCookie('access_token').status(200).send();
		//TODO: set log2FA false hihihi
		//TODO: wipe all user data en fait
    }
}
