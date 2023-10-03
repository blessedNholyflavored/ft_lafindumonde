import { IsNotEmpty, IsEmail } from 'class-validator'

export class PassDto {

	@IsNotEmpty()
	password: string;

}

export class UsernameDto {

	@IsNotEmpty()
	username: string;

}

export class MailDto{

	@IsEmail()
	email: string;

}