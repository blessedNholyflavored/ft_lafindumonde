import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async findUser() {
    try {
      const users = await prisma.user.findMany();
      return users;
    } catch (error) {
      throw new BadRequestException('finduser' + error);
    }
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

  // async getUserAchievements(id: number) {
  //   try {
  //     const achievements = await prisma.userAchievement.findMany({
  //       where: { userId: id },
  //     });
  //     return achievements;
  //   } catch (error) {
  //     throw new BadRequestException('error');
  //   }
  // }
}

// async getUserAchievements(id: number) {
//   if (id === undefined) {
//     throw new BadRequestException('Undefined user ID');
//   }
//   try {
//     const achievements = await this.prisma.userAchievement.findMany({
//       where: { userId: id },
//       include: { achievement: true },
//       });
//     return achievements;
//   } catch (error) {
//     throw new BadRequestException('getUser error : ' + error);
//   }
// }
