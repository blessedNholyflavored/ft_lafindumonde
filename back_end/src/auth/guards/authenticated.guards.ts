import { JwtGuard } from "./jwt.guards";
import { TotpGuard } from "./totp.guards"

export const AuthenticatedGuard = [JwtGuard, TotpGuard];