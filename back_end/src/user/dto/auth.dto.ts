import { IsNotEmpty, IsString, IsEmail, MaxLength, MinLength } from 'class-validator';

export class AuthDto {

  @IsNotEmpty()
	@MinLength(3)
	@MaxLength(10)
	@IsString()
  username: string;

	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(20)
	@IsString()
	password: string;

	@IsEmail()
	@IsNotEmpty()
	email: string;
	
	id: number;

	@IsNotEmpty()
	pictureURL: string;
}

export class LoginDtos {

	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(10)
	@IsString()
	username: string;

	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(20)
	@IsString()
	password: string;

}
