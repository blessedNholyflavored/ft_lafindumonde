// src/friend/dto/create-friend-request.dto.ts

import { IsInt } from 'class-validator';

export class CreateFriendRequestDto {
  @IsInt()
  senderId: number;

  @IsInt()
  recipientId: number;
}

export class AcceptFriendRequestDto {
  @IsInt()
  senderId: number;

  @IsInt()
  recipientId: number;
}
