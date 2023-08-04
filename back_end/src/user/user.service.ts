import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaUserCreateInput } from './user-create.input';
import { PrismaClient, User } from '@prisma/client';
import { createUserDto } from 'src/dto/createUserDto.dto';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async findUser() {
    try {
      const users = await prisma.user.findMany();
      return users;
    } catch (error){
      throw new BadRequestException('finduser' + error);
    }
  }

  async updateUsername(id: number, newUsername: string) {
    const updateUser = await prisma.user.update({
      where: { id: id }, // Remplacez id par l'ID de l'utilisateur que vous souhaitez mettre à jour
      data: {
        username: newUsername, // Remplacez newUsername par le nouveau nom d'utilisateur
      },
    });

    return updateUser;
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
          //userID: user.id,
          email: user.email,
          hash: "fuck",
          username: user.username,
         // pictureURL: user.pictureURL
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