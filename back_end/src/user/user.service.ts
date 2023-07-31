// backend/src/user/user.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client'; // Renommez "User" en "PrismaUser"
const prisma = new PrismaClient();

@Injectable()
export class UserService {
  prisma: any;
  async findUser() {
    const users = await prisma.user.findMany();
    return users;
  }

  async findUsernameById(id: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        username: true,
      },
    });

    return user?.username ?? null;
  }
  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id: parseInt(id) } });
  }

async findUserByUsername(username: string): Promise<User | null> {
  return this.prisma.user.findUnique({ where: { username } });
}
}

