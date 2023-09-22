import { TotpGuard } from "./totp.guards";
import { AuthGuard } from "@nestjs/passport";

export const AuthenticatedGuard = [AuthGuard('jwt'), TotpGuard];