import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
// import { UserAchievements } from '../user/user.interface';

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

  async updateUsername(id: string, newUsername: string) {
    const updateUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        username: newUsername,
      },
    });
    return updateUser;
  }

  async getPicture(id: string) {
    const User = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { pictureURL: true },
    });
    if (User) {
      console.log(User.pictureURL);
      return User.pictureURL;
    } else return null;
  }

  async getFriends(id: number) {
    if (id === undefined) {
      throw new BadRequestException('Undefined user ID');
    }
    try {
      const user = await prisma.user.findMany({
        where: {
          id: id,
        },
        // include: { friends: true, friendsOf: true },
      });
      return user;
    } catch (error) {
      throw new BadRequestException('getUser error : ' + error);
    }
  }
  // async getAchievementById(id: number) {
  //   if (id === undefined) {
  //     throw new BadRequestException('Undefined user ID');
  //   }
  //   try {
  //     const achievement = await prisma.achievement.findUniqueOrThrow({
  //       where: {
  //         id: id,
  //       },
  //     });
  //     return achievement;
  //   } catch (error) {
  //     throw new BadRequestException('getUser error : ' + error);
  //   }
  // }

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

  //   async getAllAchievements(): Promise<UserAchievements[]> {
  //     const allachiev = (await prisma.userAchievement.findMany({
  //       select: UserAchievements,
  //     })) as UserAchievements[];
  //     console.log(allachiev);
  //     return allachiev;
  //   }
  // }

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
}
