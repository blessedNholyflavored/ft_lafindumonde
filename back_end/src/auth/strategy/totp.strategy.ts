import { Strategy } from 'passport-totp';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class TotpStrategy extends PassportStrategy(Strategy) {
  //  constructor(){
   // }
}