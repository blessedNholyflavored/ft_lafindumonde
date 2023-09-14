import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UserDto {
  //Data transfer object
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  xp: number;
  level: number;
}
