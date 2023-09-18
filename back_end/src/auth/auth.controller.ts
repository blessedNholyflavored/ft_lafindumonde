import { Controller, Get, Post, Redirect, Req, Res, Body, UseGuards, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
//TODO: careful aux .guardSSSS
import { FortyTwoAuthGuard } from "./guards/FortyTwo-auth.guard";
import { ConfigService } from '@nestjs/config';
//import { JwtAuthGuard } from "./guards/jwt-auth.guards";
import { AuthGuard } from "@nestjs/passport";
// import { JwtGuard } from "./guards/jwt.guards";
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
    @Post('local_login')
    async login(@Body() body: {username: string, password: string}, @Res() res: any, @Req() req: any){
		console.log("IN AUTH CONTROLLER\nbody is : ",body);
		if (!body.username || !body.password){
			throw new BadRequestException("One field is missing");
		}
		const user = await this.userService.getUserByUsername(body.username);
		if (!user)
			throw new BadRequestException("Username doesn't exist");
		// check du password
		if (await this.authService.passwordChecker(body.password, user) == false)
			throw new UnauthorizedException("Wrong password");
		// sinn throw error
		const token = await this.authService.login(user);
		res.cookie('access_token', token.access_token, {httpOnly: true}).status(200).json({user: this.userService.exclude(user,['totpKey']), token});
    }

	@Post('register')
	async register(@Body() body: {username: string, password: string, email: string, id: number, pictureURL: string}, @Res() res: any){
		console.log("InAUTH CONTROLLER\n body in register is : ", body);
		if (!body.username || !body.password || !body.email || !body.pictureURL){
			console.log("ooops: ", body);
			throw new BadRequestException("password, username or email is missing");
		}
		let newID = await this.authService.idGenerator();
		// console.log("HERE POST ID GENERATE : newID =", newID);
		while (await this.userService.getUserByID(newID))
			newID = await this.authService.idGenerator();
		body.id = newID;
		// console.log("ICICICICIICIC final body: ", body);
		if (await this.userService.usernameAuthChecker(body.username) == true){
			// in case someone already have this username
			body.username =  body.username + '_';
		}
		console.log("BODYBODYBODY:", body);
		const user = await this.userService.createUser(body);
		const token = await this.authService.login(user);
		console.log("HEREHEREHERE: ", user, token);
		res.cookie('access_token', token.access_token, {httpOnly: true}).status(200).json({user: this.userService.exclude(user, ['totpKey']), token});
		//return res;
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
        return res.json({code: qrCodeImg});
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
