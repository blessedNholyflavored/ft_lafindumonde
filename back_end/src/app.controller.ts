import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { FortyTwoAuthGuard } from './auth/FortyTwo-auth.guard';
import { AuthService } from './auth/auth.service';
import { AuthenticatedGuard } from './auth/authenticated.guards';
import { JwtAuthGuard } from './auth/jwt-auth.guards';

@Controller()
export class AppController {
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
