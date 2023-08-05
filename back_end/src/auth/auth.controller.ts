import { Controller, Get, Post, Redirect, Req, Res, Body, UseGuards } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { FortyTwoAuthGuard } from "./FortyTwo-auth.guard";
//import { AuthGuard } from "@nestjs/passport";

@Controller("auth")
export class AuthController{
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ){}

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
        //res.redirect()
        console.log("bravo la mif");
		res.json({ token });
        return token;
    }
}
