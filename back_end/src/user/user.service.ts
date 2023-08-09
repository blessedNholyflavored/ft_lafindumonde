import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client'; // Renommez "User" en "PrismaUser"
import { PrismaService } from 'src/prisma/prisma.service';

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

  async updateUsername(id: string, newUsername: string) {
    const updateUser = await prisma.user.update({
      where: { id: parseInt(id) }, // Remplacez id par l'ID de l'utilisateur que vous souhaitez mettre à jour
      data: {
        username: newUsername, // Remplacez newUsername par le nouveau nom d'utilisateur
      },
    });

    return updateUser;
  }
  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id: parseInt(id) } });
  }

async findUserByUsername(username: string): Promise<User | null> {
  return this.prisma.user.findUnique({ where: { username } });
}
}

