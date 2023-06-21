import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HttpExceptionFilter } from '../../../filters/http-exception.filter';
import {
  UserImageDto,
  UserModel,
} from '../services/repositories/domain/user.domain';
import { UserService } from '../services/user.service';
import { AuthGuard } from '../../auth/auth.guard';
import { AuthModel } from '../../auth/auth.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { DEEP_ART_USER_SECRET } from '../../../shared/configuration';

@Controller('users')
@UseFilters(HttpExceptionFilter)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard)
  public async getAll() {
    return await this.userService.getAll();
  }

  @Get('/:id')
  public async getById(@Param('id') id: string) {
    return await this.userService.getById(id);
  }

  @Get('/username/:username')
  public async getByUsernameOrEmail(@Param('username') username: string) {
    return await this.userService.getByUsernameOrEmail(username);
  }

  @Post()
  public async create(@Body() user: UserModel) {
    return await this.userService.create(user);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  public async delete(@Param('id') id: string) {
    await this.userService.delete(id);
  }

  @Put('/:id')
  @UseGuards(AuthGuard)
  public async update(@Param('id') id: string, @Body() user: UserModel) {
    return await this.userService.update(id, user);
  }

  @Patch('/reset/password')
  public async cresetPassword(@Body() auth: AuthModel) {
    return await this.userService.resetPassword(auth);
  }

  @Patch('/update/image/:imgType')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  public async updateImage(
    @Req() request: Request,
    @Param('imgType') imgType: string,
  ) {
    const identity = request[DEEP_ART_USER_SECRET];
    return await this.userService.updateImage(
      identity.id,
      request['file'],
      imgType,
    );
  }
}
