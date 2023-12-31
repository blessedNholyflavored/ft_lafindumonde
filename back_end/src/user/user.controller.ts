import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  UseGuards,
  ConflictException,
  NotAcceptableException,
  ValidationPipe,
  UsePipes,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import * as path from 'path';
import { join } from 'path';
import { Response } from 'express';
import * as mimetype from 'mime-types';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guards';
import { NotFoundError, throwError } from 'rxjs';
import { AuthDto } from './dto/auth.dto';
import { MailDto, PassDto, UsernameDto } from './dto/settings.dto';
import { format, parseISO } from 'date-fns';

@Controller('users')
@UseGuards(...AuthenticatedGuard)
export class UsersController {
  friendService: any;
  constructor(private readonly userService: UserService) {}

  /*
  @Get('/')
  findAll() {
    const users = this.userService.findUser();
    return users;
  }
*/
  @Post('/update-username')
  @UsePipes(new ValidationPipe())
  async updating_username(@Req() req: any, @Body() username: UsernameDto) {
    const newUsername = username['username'];
    if (
      (await this.userService.updateUsername(req.user.id, newUsername)) == false
    )
      throw new ConflictException('username not available');
  }

  @Post('/update-pass')
  @UsePipes(new ValidationPipe())
  updating_password(@Req() req: any, @Body() password: PassDto) {
    const newPassword = password['password'];
    this.userService.updatePassword(req.user.id, newPassword);
  }

  @Post('/update-mail')
  @UsePipes(new ValidationPipe())
  async updating_mail(@Req() req: any, @Body() mail: MailDto) {
    const newMail = mail['email'];
    if ((await this.userService.mailChecker(newMail.toString())) === false)
      throw new ConflictException('email already taken !');
    if (
      (await this.userService.FortyTwoMailCheck(newMail.toString())) === false
    )
      throw new NotAcceptableException('email domain not allowed');
    this.userService.updateMail(req.user.id, newMail);
  }

  @Get('/:id/avatar')
  returnPic(@Param('id') id: string) {
    const pictureURL = this.userService.getPicture(id);
    return pictureURL;
  }

  @Get('/uploads/:file')
  async getFileUrl(@Param('file') filename: string, @Res() res: Response) {
    return res.sendFile(filename, { root: 'uploads/' });
  }

  @Post('/update-avatar')
  @UseInterceptors(
    FileInterceptor('userpic', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const name = file.originalname.split('.')[0];
          const fileExtName = path.extname(file.originalname);
          const rand = `${Date.now()}-${Math.round(Math.random() * 16)}`;
          cb(null, `${name}-${rand}${fileExtName}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpeg'
        ) {
          cb(null, true);
        } else {
          cb(
            new HttpException(
              'jpg/jpeg/png images files only accepted',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 1024 * 1024 * 4,
      },
    }),
  )
  async updatePic(
    @Req() req: any,
    @UploadedFile() file: any, //: Express.Multer.File)
  ) {
    //const name = file.originalname.split('.')[0];
    //const picPath = file.path;
    const test = file.filename;
    await this.userService.updatePicture(req.user.id, file.filename);
    return { test };
  }

  @Get('/:id/username')
  async getUsernameById(@Param('id') id: string) {
    const user = this.userService.getUsernameById(id);
    return user;
  }

  @Get('/:id')
  async getUserById(@Param('id') id: number) {
    const ret = await this.userService.getID(id.toString());
    return this.userService.exclude(ret, ['totpKey', 'totpQRCode', 'password']);
  }

  @Get('/:id/games-data')
  async fetchGameData(@Param('id') id: string) {
    const games = await this.userService.fetchAllGames(id);
    return games;
  }

  @Get('/:id/lostgames-data')
  async fetchLostGame(@Param('id') id: string): Promise<number> {
    const lostGames = await this.userService.fetchLostGames(id);
    return lostGames;
  }

  @Get('/status/:id')
  async getPlayerStatus(@Param('id') id: number) {
    const user = await this.userService.getUserByID(id);
    return user.status;
  }

  @Get('/leaderboard/:id')
  async getLeaderboardData(@Param('id') id: number) {
    const data = await this.userService.getLeaderboard();
    return data;
  }

  @Get('/mini/:id')
  async getMini(@Param('id') id: number) {
    const data = await this.userService.getMini();
    return data;
  }

  @Get('/:id/isloc')
  async checkIsLocal(@Param('id') id: string) {
    const data = await this.userService.isLocal(id);
    return data;
  }

  @Get('/:id/rank')
  async calculDivision(@Param('id') id: string): Promise<string> {
    const user = await this.userService.getUserByID(parseInt(id));
    let ret: string;

    if (user.ELO >= 0 && user.ELO <= 1029) {
      ret = 'iron';
    } else if (user.ELO >= 1030 && user.ELO <= 1089) {
      ret = 'silver';
    } else if (user.ELO >= 1090 && user.ELO <= 1149) {
      ret = 'gold';
    } else if (user.ELO >= 1150 && user.ELO <= 1219) {
      ret = 'platinum';
    } else if (user.ELO >= 1220 && user.ELO <= 1299) {
      ret = 'diamond';
    } else if (user.ELO >= 1300 && user.ELO <= 1399) {
      ret = 'master';
    } else if (user.ELO >= 1400) {
      ret = 'top challenger';
    } else {
      ret = 'no rank';
    }
    return ret;
  }

  @Post('/pokePic')
  async pokePic(@Req() req: any, @Res() res: any, @Body() pic: any) {
    const photo = await this.userService.updatePicture(
      req.user.id.toString(),
      pic.pictureURL.toString(),
    );
    const ret = await this.userService.getUserByID(req.user.id);
    return photo;
  }

  @Get('/:id/exist')
  async doesExist(@Param('id') id: string, @Res() res: any) {
    const user = await this.userService.getUserByID(parseInt(id));
    if (!user) throw new NotFoundException();
    res.status(200).send();
  }
}
