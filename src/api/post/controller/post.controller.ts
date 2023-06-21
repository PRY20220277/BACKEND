import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { HttpExceptionFilter } from '../../../filters/http-exception.filter';
import {
  PostModel,
  PostSearch,
} from '../services/repositories/domain/post.domain';
import { PostService } from '../services/post.service';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('posts')
@UseFilters(HttpExceptionFilter)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  public async getAll() {
    return await this.postService.getAll();
  }

  @Get('/:id')
  public async getById(@Param('id') id: string) {
    return await this.postService.getById(id);
  }

  @Get('/user/:userId')
  public async getAllByUserId(@Param('userId') userId: string) {
    return await this.postService.getAllByUserId(userId);
  }

  @Post('/search')
  public async search(@Body() search: PostSearch) {
    return await this.postService.search(search);
  }

  @Post()
  @UseGuards(AuthGuard)
  public async create(@Body() post: PostModel) {
    return await this.postService.create(post);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  public async delete(@Param('id') id: string) {
    await this.postService.delete(id);
  }

  @Put('/:id')
  @UseGuards(AuthGuard)
  public async update(@Param('id') id: string, @Body() post: PostModel) {
    return await this.postService.update(id, post);
  }
}
