import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client'; // Renommez "User" en "PrismaUser"
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaUserCreateInput } from './user-create.input';
//import { createUserDto } from 'src/dto/createUserDto.dto';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  prisma: any;
  async findUser() {
    try {
      const users = await prisma.user.findMany();
      return users;
    } catch (error){
      throw new BadRequestException('finduser' + error);
    }
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
      where: { id: id }, // Remplacez id par l'ID de l'utilisateur que vous souhaitez mettre à jour
      data: {
        username: newUsername, // Remplacez newUsername par le nouveau nom d'utilisateur
      },
    });

    return updateUser;
  }

  async getUserByID(id: number): Promise<User | undefined> {
    return await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
  }

  async getUserByUsername(username: string): Promise <User | undefined>{
    return await prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  async getID(id: number) {
  //throw new Error('Method not implemented.');
    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: id,
        },
      });
      return user;
    } catch (error) {
      throw new BadRequestException('getid error : ' + error);
    }
  }

  async createUser(user: PrismaUserCreateInput): Promise<User> {
    let tmpUser: User;

    try {
      tmpUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          hash: "",
          username: user.username,
          pictureURL: user.pictureURL,
        }
      });
      return tmpUser;
    } catch (err) {
      // doc here : https://www.prisma.io/docs/reference/api-reference/error-reference
      console.log('Error creating user:', err);
      //throw err;
    }
  }
}
}

