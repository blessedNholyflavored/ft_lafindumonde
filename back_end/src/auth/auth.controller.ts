import { Controller, Get, Post, Req, Res, Body, UseGuards, UsePipes, ValidationPipe, BadRequestException, UnauthorizedException, ConflictException, NotAcceptableException, ImATeapotException, ForbiddenException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { FortyTwoAuthGuard } from "./guards/FortyTwo-auth.guard";
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from "@nestjs/passport";
import { AuthenticatedGuard } from "./guards/authenticated.guards";
import { AuthDto, LoginDtos } from "src/user/dto/auth.dto";

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
	                    // TODO:  suppr cette route pour la prod
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
		res.cookie('access_token', token.access_token, {httpOnly: true, sameSite: true}).json({user: this.userService.exclude(user, ['totpKey', 'totpQRCode','password']), token}).statusCode(200).send();

	}

    /************************
     * 
     * 
     *                                  LOGIN LOCAL
     *      
     * 
     * *********************/
    @Post('local_login')
		@UsePipes(new ValidationPipe())
    async login(@Body() loginDtos: LoginDtos, @Res() res: any, @Req() req: any){
			// entry are checked with the class validators first
			// then check if user exists in db by username (as it's an @Unique property)
		const user = await this.userService.getUserByUsername(loginDtos.username);
		if (!user)
			return res.status(404).json({ message: { statusCode: 404, error: 'Not Found', message: "User doesn't exist" } }).send();
		//check if user is not local (and so might connect through 42auth)
		if (user.loginLoc === false)
			throw new ConflictException("wrong account type");
		// check if password is correct
		// else returns HTTP401 as RFC 7235 recommends
		if (await this.authService.passwordChecker(loginDtos.password, user) == false)
			throw new UnauthorizedException("Wrong password");
		//creates JWT and stores it in cookie
		const token = await this.authService.login(user);
		res.cookie('access_token', token.access_token, {httpOnly: true, sameSite: true}).status(200).json({user: this.userService.exclude(user,['totpKey', 'totpQRCode', 'password']), token});
    }

	@Post('register')
	@UsePipes(new ValidationPipe())
	async register(@Req() req: any, @Body() authDtos: AuthDto, @Res() res: any){
		// generating ID and checking if ID is already used
		// else regenerating it until it's not used
		let newID = await this.authService.idGenerator();
		while (await this.userService.getUserByID(newID))
			newID = await this.authService.idGenerator();
		// checker for username and email (check it doesn't exist) 
		if (await this.userService.mailChecker(authDtos.email) === false)
			throw new ConflictException("username or email already taken !");
		// check if email is not from 42 --> in this case, must use 42auth
		if (await this.userService.FortyTwoMailCheck(authDtos.email) === false)
			throw new NotAcceptableException("email domain not allowed");
		//using specific DTO for locallogin
		const user = await this.userService.createLocalUser(authDtos, newID).catch((error) => {throw new BadRequestException("something went wrong creating user");});
		//setting token and ending registering
		const token = await this.authService.login(user);
		await this.userService.setLog2FA(user, false);
		res.cookie('access_token', token.access_token, {httpOnly: true, sameSite: true}).status(200).json({user: this.userService.exclude(user, ['totpKey', 'totpQRCode', 'password']), token});
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

		// callback from intra api after user successfully logged in through 42auth
    @Get('/api/v1/auth/42/callback')
    @UseGuards(FortyTwoAuthGuard)
    async callback(@Req() req:any, @Res() res: any){
			// then setting token and ending registration
      const token = await this.authService.login(req.user);
			await this.userService.setLog2FA(req.user, false);
      res.cookie('access_token', token.access_token, {httpOnly: true , sameSite: true}).redirect('http://' + process.env.HOSTNAME + ':8080/');
      return token;
    }

		// route checking jwt token exclusively (to check if user is authenticated)
		// used by authProvider (this is from where user is returned to front)
    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    async protected(@Req() req: any) {
        return this.userService.exclude(req.user, ['totpKey','totpQRCode', 'password']);
    }

    /************************
     * 
     * 
     *                                  2FA ENABLER / DISABLER
     *      
     * 
     * *********************/
    @Get('2FAenable')
    @UseGuards(...AuthenticatedGuard)
    async twoFAenabler(@Req() req: any, @Res() res: any){
        // resetting 2FA in case 2FA is already enabled
        if (req.user.enabled2FA == true){
            await this.userService.disable2FA(req.user.id);
        }
				// generating 2 FA key for /saveTotp page with generated qrCode
        const { qrCodeImg, user } = await this.authService.generate2FAkey(req.user);
				if (qrCodeImg && user)
					return res.status(200).send();
				else
					throw new BadRequestException('Wrong request');
    }

    @Get('checkIs2FA')
    @UseGuards(...AuthenticatedGuard)
    async is2FAcheck(@Req() req: any, @Res() res: any){
			// checker for 2FA but it's really just an excuse to get teapotException like a funny easter egg
        if (req.user.log2FA === true){
            throw new ImATeapotException("Well, you are a teapot");
        }
        return res.status(200).send();
    }

    @Get('2FAdisable')
    @UseGuards(...AuthenticatedGuard)
    async twoFAdisabler(@Req() req: any){
			// back side check if already enabled
        if (req.user.enabled2FA == false)
            throw new ConflictException("Not enabled");
        else {
						// else : disabling accordingly
            const updtUser = await this.userService.disable2FA(req.user.id);
						await this.userService.setLog2FA(updtUser, false);
            if (updtUser.enabled2FA == false)
                {return this.userService.exclude(updtUser, ['totpKey','totpQRCode', 'password']);}
            else
                throw new BadRequestException("Issue encountered while disabling 2FA");
        }
        // return this.userService.exclude(req.user, ['totpKey', 'totpQRCode', 'password']);
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
			// checking code with totp specific guard 
			// so this gets enabled only if code submitted is good
			// if not, it won't go here and 2fa won't be enabled
        const user = await this.userService.getUserByID(req.user.id);
        await this.userService.enable2FA(user.id);
				await this.userService.setLog2FA(user, true);
        return res.status(200).json(this.userService.exclude(user, ['totpKey', 'totpQRCode','password']));
    }

	// submit input during auth login
	@Post('submitInput')
	@UseGuards(AuthGuard('jwt'), AuthGuard('totp'))
	async inputChecker(@Req() req: any, @Res() res: any, @Body() body: {userInput: string, userID: number}){
		const user = await this.userService.getUserByID(req.user.id);
		//set user.log2FA to true only after code was validated by totp specific guard
		const updtUser = await this.userService.setLog2FA(user, true);
		return res.status(200).json(this.userService.exclude(updtUser, ['totpKey','totpQRCode', 'password']));
	}

	// specific route called to display QRcode with totp encrypted key
	// the QR code is stored as an img in db
	@Get('getQRCode')
	@UseGuards(...AuthenticatedGuard)
	async getQRCodeImg(@Req() req: any, @Res() res: any) {
		const user = await this.userService.getUserByID(req.user.id);
		if (!user)
			throw new ForbiddenException();
		return (res.status(200).json({qrCode: user.totpQRCode}))
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
			// setting status to offline with logout, setting off 2FA and clearing cookie
			await this.userService.updateUserStatuIG(req.user.id, 'OFFLINE');
			await this.userService.setLog2FA(req.user, false);
      res.clearCookie('access_token').status(200).send();
    }
}
