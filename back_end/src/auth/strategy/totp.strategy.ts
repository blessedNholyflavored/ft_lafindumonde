import { Strategy } from 'passport-totp';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

function getTotpKey(this: null, user:any, done: (err: any, key: Buffer, period: number) => any): any {
  const key = {
    //ici decrypt totpkey
    key: Buffer.from(user.totpKey),
    period: 30,
  }
  return done(null, key.key, key.period);
}

@Injectable()
export class TotpStrategy extends PassportStrategy(Strategy) {
  constructor(){
    super({window: 10}, getTotpKey);
  }
}