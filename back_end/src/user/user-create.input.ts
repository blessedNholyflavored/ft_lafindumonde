// inteface to force the dto and shit match what Prisma waits
export interface PrismaUserCreateInput{
    id: number;
    email: string;
    hash: string;
    username: string;
	pictureURL: string;
    enabled2FA: boolean;
    totpKey: string;
}
