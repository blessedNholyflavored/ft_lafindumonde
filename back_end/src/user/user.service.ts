import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, User, USER_STATUS } from '@prisma/client'; // Renommez "User" en "PrismaUser"
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaUserCreateInput } from './user-create.input';
//import { createUserDto } from 'src/dto/createUserDto.dto';
// import { UserAchievements } from '../user/user.interface';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  prisma: any;
  async findUser() {
    try {
      const users = await prisma.user.findMany();
      return users;
    } catch (error) {
      throw new BadRequestException('finduser' + error);
    }
  }

  async findUsernameById(id: number): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        username: true,
      },
    });

    return user?.username ?? null;
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

  async updateUsername(id: string, newUsername: string)
  {
	console.log("dans controleur", id);
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
      return (User.pictureURL);
    }
	else
		return null;
  }

  async updatePicture(id: string, newURL: string)
  {
	console.log(newURL);
	const updateUser = await prisma.user.update({
		where: { id: parseInt(id)},
		data: { pictureURL: newURL, },
	});
	return (updateUser.pictureURL);
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

  async updateUserStatuIG(id: number, newStatus: USER_STATUS)
  {
    const updateUser = await prisma.user.update({
      where: { id : id},
      data: { status: newStatus,} 
    })
    return updateUser;
  }

  async updateGamePlayer(id: string)
  {
    const updateUser = await prisma.user.update({
      where: { id : parseInt(id)},
      data: { gameplayed: {increment: 1},} 
    })
    return updateUser;
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

  async usernameAuthChecker(username: string){
    let tmpUser = await this.getUserByUsername(username);

    if (tmpUser)
      return true;
    return false;
  }
  async createUser(user: PrismaUserCreateInput): Promise<User> {
    let tmpUser: User;

    try {
      tmpUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
        //   hash: "",
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

