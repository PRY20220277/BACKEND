import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HttpExceptionFilter } from '../../../filters/http-exception.filter';
import { MediaLibraryModel } from '../services/repositories/domain/media-library.domain';
import { MediaLibraryService } from '../services/media-library.service';
import { AuthGuard } from '../../auth/auth.guard';
import { Request } from 'express';
import {
  DistortImageRequest,
  DownloadImageRequest,
  UploadRequest,
} from '../services/repositories/domain/upload-request.domain';
import { FileInterceptor } from '@nestjs/platform-express';
import { DEEP_ART_USER_SECRET } from '../../../shared/configuration';

@Controller('medialibrary')
@UseFilters(HttpExceptionFilter)
export class MediaLibraryController {
  constructor(private readonly mediaLibraryService: MediaLibraryService) {}

  @Get()
  @UseGuards(AuthGuard)
  public async getAll() {
    return await this.mediaLibraryService.getAll();
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  public async getById(@Param('id') id: string) {
    return await this.mediaLibraryService.getById(id);
  }

  @Get('/users/:userId')
  @UseGuards(AuthGuard)
  public async getAllByUserId(@Param('userId') userId: string) {
    return await this.mediaLibraryService.getAllByUserId(userId);
  }

  @Post()
  @UseGuards(AuthGuard)
  public async create(@Body() image: MediaLibraryModel) {
    return await this.mediaLibraryService.create(image);
  }

  @Post('/upload/files')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  public async upload(@Req() request: Request, @Body() body: UploadRequest) {
    const file = new UploadRequest();
    file.userId = request[DEEP_ART_USER_SECRET].id;
    file.username = request[DEEP_ART_USER_SECRET].username;
    file.audioFile = request['file'];

    return await this.mediaLibraryService.upload(file);
  }

  @Post('/images/generate')
  @UseGuards(AuthGuard)
  public async generateImages(@Body() request: any) {
    return await this.mediaLibraryService.generateImages(request);
  }

  @Put('/images/variation')
  @UseGuards(AuthGuard)
  public async generateVariation(@Body() request: any) {
    return await this.mediaLibraryService.generateVariation(request);
  }

  @Post('/distort/image')
  @UseGuards(AuthGuard)
  public async distortImage(
    @Req() request: Request,
    @Body() body: DistortImageRequest,
  ) {
    const model = new DistortImageRequest();
    model.imageUrl = body.imageUrl;
    model.audioUrl = body.audioUrl;
    model.userId = request[DEEP_ART_USER_SECRET].id;
    model.username = request[DEEP_ART_USER_SECRET].username;

    return await this.mediaLibraryService.distortImage(model);
  }

  @Post('/download/image')
  @UseGuards(AuthGuard)
  public async downloadImage(@Body() body: DownloadImageRequest) {
    return await this.mediaLibraryService.downloadImage(body);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  public async delete(@Param('id') id: string) {
    await this.mediaLibraryService.delete(id);
  }
}
