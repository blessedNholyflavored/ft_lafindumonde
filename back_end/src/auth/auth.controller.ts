import { Controller, Get, Post, Redirect, Req, Res, Body, UseGuards, BadRequestException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { FortyTwoAuthGuard } from "./guards/FortyTwo-auth.guard";
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from "./guards/jwt-auth.guards";
import { AuthGuard } from "@nestjs/passport";

@Controller("auth")
export class AuthController{
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
	    private config: ConfigService,
    ){}

	// DEV ROUTE FOR TEST
	// TODO: suppr cette route pour la prod
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
    //pour plus tard
    @Post('login')
    async login(@Body() loginDto:any){
        console.log('jsp gros');
        return ;
    }

    @Get('login42')
    @UseGuards(FortyTwoAuthGuard)
    async login42(){
        console.log('hello??');
    }

    @Get('/api/v1/auth/42/callback')
    @UseGuards(FortyTwoAuthGuard)
    async callback(@Req() req:any, @Res() res: any){
        const token = await this.authService.login(req.user);
        res.cookie('access_token', token.access_token, {httpOnly: true }).redirect('http://localhost:8080/');
        return token;
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async protected(@Req() req: any) {
        //return (`Salut ${user}`);
        return req.user;
    }

    @Get('logout')
    async   logout(@Res() res: any){
        res.clearCookie('access_token').status(200).send();
    }
}
