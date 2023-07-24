import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async findUser() {
    const users = await prisma.user.findMany();
    return users;
  }

  async updateUsername(username: string) {
	const user = await prisma.user.findUnique({
		where:	{ id : 1 },
	});
	prisma.user.update({
		where:	{ id : 1 },
		data:	{ username }
	})
  }
}
