import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async findUser() {
    const users = await prisma.user.findMany();
    return users;
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

  async getPicture(id: string) {
	const User = await prisma.user.findUnique({
		where: { id: parseInt(id)},
		select: { pictureURL: true, },
	  });
	if (User)
	{
		console.log(User.pictureURL);
		return (User.pictureURL);
	}
	else
		return (null);
  }
}
