// inteface to force the dto and shit match what Prisma waits
export interface PrismaUserCreateInput{
    id: number;
    email: string;
    password: string;
    username: string;
		pictureURL: string;
}
