import { Controller, Get, Post, Redirect, Req, Res, Body, UseGuards, UsePipes, ValidationPipe, BadRequestException, UnauthorizedException, ConflictException, NotAcceptableException, ImATeapotException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { FortyTwoAuthGuard } from "./guards/FortyTwo-auth.guard";
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from "@nestjs/passport";
import { AuthenticatedGuard } from "./guards/authenticated.guards";
import { AuthDto } from "src/user/dto/auth.dto";
//import * as bcrypt from 'bcrypt';
//import * as speakeasy from 'speakeasy';

@Controller("auth")
export class AuthController{
    constructor(
			private readonly authService: AuthService,
			private readonly userService: UserService,
			private readonly config: ConfigService,
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
			throw new BadRequestException("id, username or email is missing");
		}
		const user = await this.authService.retrieveUser(body);
		const token = await this.authService.login(user);
		res.cookie('access_token', token.access_token, {httpOnly: true}).json({user: this.userService.exclude(user, ['totpKey', 'password']), token}).statusCode(200).send();

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
		if (!body.username || !body.password){
			throw new BadRequestException("One field is missing");
		}
		const user = await this.userService.getUserByUsername(body.username);
		if (!user)
			return res.status(404).json({ message: { statusCode: 404, error: 'Not Found', message: "User doesn't exist" } }).send();
		if (user.loginLoc === false)
			throw new ConflictException("wrong account type");
		// check if password is correct
		// else returns HTTP401 as RFC 7235 recommends
		if (await this.authService.passwordChecker(body.password, user) == false)
			throw new UnauthorizedException("Wrong password");
		//creates JWT
		const token = await this.authService.login(user);
		res.cookie('access_token', token.access_token, {httpOnly: true}).status(200).json({user: this.userService.exclude(user,['totpKey', 'password']), token});
    }

	@Post('register')
	@UsePipes(new ValidationPipe())
	async register(@Req() req: any, @Body() authDtos: AuthDto, @Res() res: any){
		//generating ID and checking if ID is already used
		let newID = await this.authService.idGenerator();
		while (await this.userService.getUserByID(newID))
			newID = await this.authService.idGenerator();
		//TODO: CHEKER for username and email (check it doesn't exist) --> if it exists ? strange
		if (await this.userService.mailChecker(authDtos.email) === false)
			throw new ConflictException("username or email already taken !");
		if (await this.userService.FortyTwoMailCheck(authDtos.email) === false)
			throw new NotAcceptableException("email domain not allowed");
		//using specific DTO for locallogin
		const user = await this.userService.createLocalUser(authDtos, newID);
		//setting token and ending registering
		const token = await this.authService.login(user);
		await this.userService.setLog2FA(user, false);
		res.cookie('access_token', token.access_token, {httpOnly: true}).status(200).json({user: this.userService.exclude(user, ['totpKey', 'password']), token});
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
      res.cookie('access_token', token.access_token, {httpOnly: true }).redirect('http://' + process.env.HOSTNAME + ':8080/');
      return token;
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    async protected(@Req() req: any) {
        return this.userService.exclude(req.user, ['totpKey', 'password']);
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

    @Get('checkIs2FA')
    @UseGuards(...AuthenticatedGuard)
    async is2FAcheck(@Req() req: any, @Res() res: any){
        if (req.user.log2FA === true){
            throw new ImATeapotException("Well, you are a teapot");
        }
        return res.status(200).send();
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
            return this.userService.exclude(updtUser, ['totpKey', 'password']);
        }
        return this.userService.exclude(req.user, ['totpKey', 'password']);
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
        /*if (!body.userInput || !body.userID){
            console.log(body);
            throw new BadRequestException("input is missing or user is invalid");
        }*/
        const user = await this.userService.getUserByID(req.user.id);
        await this.userService.enable2FA(user.id);
		await this.userService.setLog2FA(user, true);
        return res.status(200).json(this.userService.exclude(user, ['totpKey', 'password']));
    }

	// submit input during auth login
	@Post('submitInput')
	@UseGuards(AuthGuard('jwt'), AuthGuard('totp'))
	async inputChecker(@Req() req: any, @Res() res: any, @Body() body: {userInput: string, userID: number}){
		const user = await this.userService.getUserByID(req.user.id);
		//set user.log2FA a true
		const updtUser = await this.userService.setLog2FA(user, true);
		return res.status(200).json(this.userService.exclude(updtUser, ['totpKey', 'password']));
	}
    /************************
     * 
     * 
     *                                  LOGOUT
     *      
     * 
     * *********************/
    @Get('logout')
		@UseGuards(...AuthenticatedGuard)
    async   logout(@Res() res: any, @Req() req: any){
			//console.log("IN LOGOUT:", req, req.user);
			await this.userService.updateUserStatuIG(req.user.id, 'OFFLINE');
			await this.userService.setLog2FA(req.user, false);
      res.clearCookie('access_token').status(200).send();
    }
}
