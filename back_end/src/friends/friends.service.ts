import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
  ) {}

  async showFriends(id: string) {
    // const { id } = userId;
    try {
      const friends = await this.prisma.user.findMany();
      return friends;
    } catch (error) {
      console.error(error);
    }
  }
}

/*
  const userRelationSelectFields = {
    ID: true,
    userId: true,
    relationId: true,
    status: true
}
    async getAllRelations():Promise<UserRelationDb[]> {
        const allRelations = await this.prisma.userRelation.findMany({
            select: userRelationSelectFields
        }) as UserRelationDb[];
        return (allRelations);
    }
*/
