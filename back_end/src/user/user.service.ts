// user.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async findUser() {
    try {
      const users = await prisma.user.findMany();
      return users;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs :', error);
      throw new Error('Une erreur est survenue lors de la récupération des utilisateurs');
    }
  }

  async findUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });
      return user;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur :', error);
      throw new Error('Une erreur est survenue lors de la récupération de l\'utilisateur');
    }
  }
}

