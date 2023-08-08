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
      where: { id: parseInt(id) },
      data: { username: newUsername, },
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
		//console.log(User.pictureURL);
		return (User.pictureURL);
	}
	else
		return (null);
  }

  async updatePicture(id: string, newURL: string)
  {
	console.log(newURL);
	const updateUser = await prisma.user.update({
		where: { id: parseInt(id)},
		data: { pictureURL: newURL, },
	});
	return (updateUser);
  }
}
