import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class AuthDto {

  @IsNotEmpty()
  username: string;

	@IsNotEmpty()
	password: string;

	@IsEmail()
	email: string;
	
	id: number;

	@IsNotEmpty()
	pictureURL: string;
}
