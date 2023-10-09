import { UserDto } from './dto/user.dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, User, USER_STATUS } from '@prisma/client'; // Renommez "User" en "PrismaUser"
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaUserCreateInput } from './user-create.input';
import { Game, Leaderboard, MiniScore } from '../interfaces';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
//import { createUserDto } from 'src/dto/createUserDto.dto';
// import { UserAchievements } from '../user/user.interface';
import { merge } from 'lodash';
import { plainToClass } from 'class-transformer';
import { parse } from 'path';
import { format } from 'date-fns';

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

  async getID(id: string) {
    //throw new Error('Method not implemented.');
    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: parseInt(id),
        },
      });
      const userDTO = plainToClass(UserDto, user);
      return userDTO;
    } catch (error) {
      throw new BadRequestException('getUserkkkkkkkkkkk error : ' + error);
    }
  }

  async updateUsername(id: string, newUsername: string): Promise<Boolean> {
    console.log('dans controleur', id);
    let updatedUser = await this.getUserByID(parseInt(id));
    if ((await this.usernameAuthChecker(newUsername)) === false) {
      updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          username: newUsername,
        },
      });
      return true;
    }
    return false;
  }

  async updatePassword(id: string, newPassword: string) {
    console.log('dans controleur', id);
    let hashedPwd = await this.passwordHasher(newPassword);
    const updateUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        password: hashedPwd,
      },
    });
    return updateUser;
  }

  async updateMail(id: string, newMail: string) {
    // console.log('dans controleur', id);
    const updateUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        email: newMail,
      },
    });
    return updateUser;
  }

  async mailChecker(mail: string): Promise<Boolean> {
    const tmpUser = await this.getUserByEmail(mail);
    if (tmpUser) return false;
    return true;
  }

  async FortyTwoMailCheck(mail: string): Promise<Boolean> {
    const str = mail.split('@').slice(1);
    if (str.includes('student.42.fr')) return false;
    return true;
  }

  async getPicture(id: string) {
    const User = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { pictureURL: true },
    });
    if (User) {
      return User.pictureURL;
    } else return null;
  }

  async updatePicture(id: string, newURL: string) {
    console.log(newURL);
    const updateUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { pictureURL: newURL },
    });
    return updateUser.pictureURL;
  }

  async getUsernameById(id: string) {
    const User = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    return User.username;
  }

  async fetchAllGames(id: string) {
    const ret1 = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { game1: true },
    });
    const ret2 = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { game2: true },
    });
    if (ret1 && ret2) {
      const ret = merge(ret1, ret2);
      const allGames: Game[] = [...ret.game1, ...ret.game2].sort(
        (a, b) => Date.parse(a.start_at) - Date.parse(b.start_at),
      );
      const formattedAllGames: Game[] = allGames.map((game) => ({
        ...game,
        start_at: format(new Date(game.start_at), 'dd/MM/yyyy HH:mm'),
      }));
      return formattedAllGames.slice(0, 5);
    }
  }

  async fetchLostGames(id: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { game1: true, game2: true },
    });
    if (!user) {
      return 0;
    }
    const allGames = [...user.game1, ...user.game2];
    const lostGames = allGames.filter((game) => game.winnerId !== parseInt(id));
    return lostGames.length;
  }

  async getMini() {
    const ret: MiniScore[] = [];
    const users = await prisma.user.findMany({
      orderBy: { scoreMiniGame: 'desc' },
    });
    const leaderboard: MiniScore[] = users.map((user, index) => ({
      id: user.id,
      username: user.username,
      scoreMiniGame: user.scoreMiniGame,
      place: index + 1,
    }));
    return leaderboard;
  }

  async getLeaderboard() {
    const ret: Leaderboard[] = [];
    const users = await prisma.user.findMany({
      orderBy: { ELO: 'desc' },
    });
    const leaderboard: Leaderboard[] = users.map((user, index) => ({
      id: user.id,
      username: user.username,
      ELO: user.ELO,
      place: index + 1,
    }));
    return leaderboard;
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
        include: { friends: true, friendsOf: true },
      });
      return user;
    } catch (error) {
      throw new BadRequestException('getUser error : ' + error);
    }
  }

  async addFriends(id1: number, id2: number) {
    const updateUser = await prisma.user.update({
      where: {
        id: id1,
      },
      include: { friends: true, friendsOf: true },
      data: {
        friends: { connect: { id: id2 } },
      },
    });
    const updateUser1 = await prisma.user.update({
      where: {
        id: id2,
      },
      include: { friends: true, friendsOf: true },
      data: {
        friends: { connect: { id: id1 } },
      },
    });
  }

  async updateUserStatuIG(id: number, newStatus: USER_STATUS) {
    const updateUser = await prisma.user.update({
      where: { id: id },
      data: { status: newStatus },
    });
    return updateUser;
  }

  async getStatusUser(id: number) {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    return user.status;
  }

  async updateScoreMiniGame(id: number, newScore: number) {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (newScore > user.scoreMiniGame) {
      const updatedUser = await prisma.user.update({
        where: { id: id },
        data: { scoreMiniGame: newScore },
      });

      return updatedUser;
    } else {
      return user;
    }
  }

  async isLocal(id: string) {
    const ret = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (ret) return ret.loginLoc;
  }

  async updateGamePlayer(id: string) {
    const updateUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { gameplayed: { increment: 1 } },
    });
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

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async usernameAuthChecker(username: string) {
    const tmpUser = await this.getUserByUsername(username);

    if (tmpUser) return true;
    return false;
  }

  async passwordHasher(input: string) {
    if (!input) return null;
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(input, saltOrRounds);
    return hash.toString();
  }

  async createUser(
    user: PrismaUserCreateInput,
    boolLocal: boolean,
  ): Promise<User> {
    let tmpUser: User;
    let hashedPwd = await this.passwordHasher(user.password);
    try {
      tmpUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          password: hashedPwd,
          username: user.username,
          pictureURL: user.pictureURL,
          enabled2FA: false,
          log2FA: false,
          loginLoc: boolLocal,
          gameplayed: 0,
          scoreMiniGame: 0,
          ELO: 1000,
          level: 0,
          xp: 0,
        },
      });
      return tmpUser;
    } catch (err) {
      //TODO: return the accurate error
      // doc here : https://www.prisma.io/docs/reference/api-reference/error-reference
      console.error('Error creating user:', err);
      //throw err;
    }
  }

  async createLocalUser(user: AuthDto, id: number): Promise<User> {
    let tmpUser: User;
    while ((await this.usernameAuthChecker(user.username)) === true) {
      //in case someone already have this username
      user.username = user.username + '_';
    }
    let hashedPwd = await this.passwordHasher(user.password);
    try {
      tmpUser = await prisma.user.create({
        data: {
          id: id,
          email: user.email,
          password: hashedPwd,
          username: user.username,
          pictureURL: user.pictureURL,
          enabled2FA: false,
          log2FA: false,
          loginLoc: true,
          gameplayed: 0,
          scoreMiniGame: 0,
          ELO: 1000,
          level: 0,
          xp: 0,
        },
      });
      return tmpUser;
    } catch (err) {
      console.error('Error creating user:', err);
    }
  }

  async enable2FA(id: number) {
    const updateUser = await prisma.user.update({
      where: { id: id },
      data: { enabled2FA: true },
    });
    return updateUser;
  }

  async disable2FA(id: number) {
    const updateUser = await prisma.user.update({
      where: { id: id },
      data: { enabled2FA: false },
    });
    return updateUser;
  }

  async add2FAKey(hash: string, id: number) {
    const updateUser = await prisma.user.update({
      where: { id: id },
      data: { totpKey: hash },
    });
    return updateUser;
  }

  async setLog2FA(user: any, bool: boolean) {
    const updateUser = await prisma.user.update({
      where: { id: user.id },
      data: { log2FA: bool },
    });
    return updateUser;
  }

  exclude<User, Key extends keyof User>(
    user: User,
    keys: Key[],
  ): Omit<User, Key> {
    return Object.fromEntries(
      Object.entries(user).filter(([key]) => !(keys as string[]).includes(key)),
    ) as Omit<User, Key>;
  }

  async calculateLevel(xp: number): Promise<number> {
    return Math.floor(xp / 10) + 1;
  }

  async calculateEloChange(
    winnerElo: number,
    loserElo: number,
    result: number,
  ) {
    const expectedScoreA = 1 / (1 + 10 ** ((loserElo - winnerElo) / 400));
    const eloChange = 32 * (result - expectedScoreA);
    return eloChange;
  }

  async updateLevelExpELO(loserID: number, winnerID: number) {
    const updateLoser = await prisma.user.update({
      where: { id: loserID },
      data: { xp: { increment: 1 } },
    });
    const updateWinner = await prisma.user.update({
      where: { id: winnerID },
      data: { xp: { increment: 2 } },
    });

    const loserLevel = this.calculateLevel(updateLoser.xp);
    if ((await loserLevel) !== updateLoser.level) {
      const updateLoser = await prisma.user.update({
        where: { id: loserID },
        data: { level: { increment: 1 } },
      });
    }
    const winnerLevel = this.calculateLevel(updateWinner.xp);
    if ((await winnerLevel) !== updateWinner.level) {
      const updateWinner = await prisma.user.update({
        where: { id: winnerID },
        data: { level: { increment: 1 } },
      });
    }

    const k = 32;
    const eloDifference = updateWinner.ELO - updateLoser.ELO;

    const expectedScoreWinner = 1 / (1 + Math.pow(10, -eloDifference / 400));
    const expectedScoreLoser = 1 - expectedScoreWinner;

    const eloChangeWinner = k * (1 - expectedScoreWinner);
    const eloChangeLoser = k * (0 - expectedScoreLoser);

    const updateWinner1 = await prisma.user.update({
      where: { id: winnerID },
      data: { ELO: Number(updateWinner.ELO + eloChangeWinner) },
    });

    const updateLoser1 = await prisma.user.update({
      where: { id: loserID },
      data: { ELO: Number(updateLoser.ELO + eloChangeLoser) },
    });
  }
}
