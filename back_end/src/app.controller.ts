import { Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { FortyTwoAuthGuard } from './auth/FortyTwo-auth.guard';
import { AuthService } from './auth/auth.service';
import { AuthenticatedGuard } from './auth/authenticated.guards';
import { JwtAuthGuard } from './auth/jwt-auth.guards';
import { UserService } from './user/user.service';
import { User } from '@prisma/client';

@Controller()
export class AppController {
	userService: any;
  constructor(private readonly authService: AuthService) {}

	//POST /login
	@UseGuards(FortyTwoAuthGuard)
	@Post('login')
	login(@Request() req): any{
		return this.authService.login(req.user);
	}

	//GET /protected
	@UseGuards(JwtAuthGuard)
	@Get('protected')
	getHello(@Request() req): string {
		return req.user;
	}
}
