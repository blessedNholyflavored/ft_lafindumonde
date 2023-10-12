import { TotpGuard } from "./totp.guards";
import { AuthGuard } from "@nestjs/passport";

// unite jwt guard to check token AND totpGuard to check 2fa
export const AuthenticatedGuard = [AuthGuard('jwt'), TotpGuard];