import { Controller, Get, Post, Redirect, Req, Res, Body, UseGuards } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { FortyTwoAuthGuard } from "./FortyTwo-auth.guard";
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from "./jwt-auth.guards";
import { AuthGuard } from "@nestjs/passport";

@Controller("auth")
export class AuthController{
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
	private config: ConfigService,
    ){}

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