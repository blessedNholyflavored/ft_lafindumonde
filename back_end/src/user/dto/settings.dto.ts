import { IsNotEmpty, IsEmail, IsString, MinLength, MaxLength } from 'class-validator'

export class PassDto {

	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	@MaxLength(20)
	password: string;

}

export class UsernameDto {

	@IsNotEmpty()
	@IsString()
	@MinLength(3)
	@MaxLength(10)
	username: string;

}

export class MailDto{

	@IsEmail()
	@IsNotEmpty()
	email: string;

}