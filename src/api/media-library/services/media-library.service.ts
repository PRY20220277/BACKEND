import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaLibraryModel } from './repositories/domain/media-library.domain';
import { ItemDefinition } from '@azure/cosmos';
import { MediaLibraryRepository } from './repositories/media-library.repository';
import { OpenAIClient } from '../../../shared/open-ai/open-ai.client';
import { BlobStorageClient } from '../../../shared/blob-storage/blob-storage.client';
import { Guid } from 'guid-typescript';
import { Util } from '../../../shared/utils';
import sharp from 'sharp';
import Jimp, { read } from 'jimp';
import {
  DistortImageRequest,
  DownloadImageRequest,
  UploadRequest,
} from './repositories/domain/upload-request.domain';

@Injectable()
export class MediaLibraryService {
  private readonly openAIClient: OpenAIClient;
  private readonly blobStorageClient: BlobStorageClient;
  private readonly util: Util;
  private readonly MAX_IMAGES_ALLOWED: number = 3;

  constructor(private readonly mediaLibraryRepository: MediaLibraryRepository) {
    this.openAIClient = new OpenAIClient();
    this.blobStorageClient = new BlobStorageClient();
    this.util = new Util();
  }

  public async getAll(): Promise<ItemDefinition[]> {
    return await this.mediaLibraryRepository.fetchAll();
  }

  public async getById(id: string): Promise<MediaLibraryModel> {
    const mediaLibrary = await this.mediaLibraryRepository.findMediaLibraryById(
      id,
    );
    if (!mediaLibrary) {
      throw new NotFoundException('Media library not found.');
    }

    return mediaLibrary;
  }

  public async getAllByUserId(userId: string): Promise<MediaLibraryModel[]> {
    const mediaLibraries = await this.mediaLibraryRepository.getAllByUserId(
      userId,
    );
    if (!mediaLibraries) {
      throw new NotFoundException('User has no media libraries.');
    }

    return mediaLibraries;
  }

  public async create(
    mediaLibrary: MediaLibraryModel,
  ): Promise<MediaLibraryModel> {
    const entity = this.mediaLibraryRepository.createEntity(mediaLibrary);
    const newMediaLibrary = await this.mediaLibraryRepository.create(entity);
    return newMediaLibrary;
  }

  public async upload(request: UploadRequest): Promise<MediaLibraryModel> {
    const fileInfo = {
      name: request.audioFile.originalname.split('.mp3')[0],
      file: null,
      type: null,
      size: request.audioFile.size,
      length: request.audioFile.size,
      hasAnyFile: false,
    };

    if (request.imageUrl) {
      fileInfo.file = await this.util.downloadFromURL(request.imageUrl);
      fileInfo.type = 'webp';
      fileInfo.length = fileInfo.file.length;
      fileInfo.size = fileInfo.file.length;
      fileInfo.hasAnyFile = true;
    }

    if (request.imageFile && !fileInfo.hasAnyFile) {
      fileInfo.file = request.imageFile;
      fileInfo.type = 'webp';
      fileInfo.length = fileInfo.file.length;
      fileInfo.size = fileInfo.file.length;
      fileInfo.hasAnyFile = true;
    }

    if (request.youtubeUrl && !fileInfo.hasAnyFile) {
      fileInfo.file = await this.util.downloadAudioFromYoutubeURL(
        request.youtubeUrl,
      );
      fileInfo.type = 'mp3';
      fileInfo.length = fileInfo.file.length;
      fileInfo.size = fileInfo.file.length;
      fileInfo.hasAnyFile = true;
    }

    if (request.audioFile && !fileInfo.hasAnyFile) {
      fileInfo.file = request.audioFile.buffer;
      fileInfo.type = 'mp3';
      fileInfo.length = fileInfo.file.length;
      fileInfo.size = fileInfo.file.size;
      fileInfo.hasAnyFile = true;
    }

    if (!fileInfo.hasAnyFile) {
      throw new NotFoundException('File must be included in request');
    }

    try {
      const url = await this.blobStorageClient.uploadFile(fileInfo);

      const mediaLibrary = new MediaLibraryModel();
      mediaLibrary.url = url;
      mediaLibrary.name = fileInfo.name;
      mediaLibrary.size = fileInfo.size;
      mediaLibrary.type = fileInfo.type;
      mediaLibrary.userId = request.userId;
      mediaLibrary.username = request.username;
      mediaLibrary.ipAddress = request.ipAddress;
      mediaLibrary.userAgent = request.userAgent;

      // if (request.imageFile || request.imageUrl) {
      //   const imageInfo = await this.util.getImageInfoFromBuffer(fileInfo.file);
      //   mediaLibrary.height = imageInfo.height;
      //   mediaLibrary.width = imageInfo.width;
      // }

      // if (request.youtubeUrl || request.audioFile) {
      //   const audioInfo = await this.util.getAudioInfoFromStream(fileInfo.file);
      //   mediaLibrary.duration = audioInfo.duration;
      // }

      const entity = this.mediaLibraryRepository.createEntity(mediaLibrary);
      const newMediaLibrary = await this.mediaLibraryRepository.create(entity);

      return newMediaLibrary;
    } catch (error) {
      throw error;
    }
  }

  public async generateImages(request: any): Promise<string[]> {
    if (!request.prompt) {
      throw new BadRequestException('Prompt is necessary.');
    }

    try {
      const images = await this.openAIClient.generateImages({
        prompt: request.prompt,
        n: this.MAX_IMAGES_ALLOWED,
      });

      const result = await this.uploadImages(images.map((x: any) => x.url));
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async generateVariation(request: any): Promise<string[]> {
    if (!request.url) {
      throw new BadRequestException('URL is necessary.');
    }

    try {
      const buffer = await this.util.downloadFromURL(request.url, 'stream');
      buffer.name = Guid.create().toString();

      const images = await this.openAIClient.generateVariationFromImage(
        buffer,
        this.MAX_IMAGES_ALLOWED,
      );

      const result = await this.uploadImages(images.map((x: any) => x.url));
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async distortImage(request: DistortImageRequest): Promise<string> {
    if (!request.imageUrl) {
      throw new BadRequestException('Image URL is necessary.');
    }

    if (!request.audioUrl) {
      throw new BadRequestException('Audio URL is necessary.');
    }

    try {
      const imageStream = await this.util.downloadFromURL(
        request.imageUrl,
        'stream',
      );

      const audioStream = await this.util.downloadFromURL(
        request.audioUrl,
        'stream',
      );

      const decibelAverage = await this.util.getAudioInfoFromStream(
        audioStream,
      );

      const distortImageStream = await this.util.distortImage(
        request.imageUrl,
        decibelAverage,
      );

      const result = await this.blobStorageClient.uploadFile({
        name: Guid.create(),
        type: 'webp',
        file: distortImageStream,
        length: distortImageStream.length,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async downloadImage(request: DownloadImageRequest): Promise<string> {
    try {
      const resizedImage = await read(request.imageUrl).then((image) => {
        return image.resize(request.width, request.height);
      });
      const newBufferImage = await resizedImage.getBufferAsync('image/png');

      const result = await this.blobStorageClient.uploadFile({
        name: Guid.create().toString(),
        type: request.format,
        file: newBufferImage,
        length: newBufferImage.length,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  private async uploadImages(images: string[]): Promise<string[]> {
    const result: string[] = [];

    for (const image of images) {
      const url = await this.blobStorageClient.uploadFromURL(
        Guid.create().toString(),
        image,
      );
      result.push(url);
    }

    return result;
  }

  public async delete(id: string) {
    const exists = await this.mediaLibraryRepository.findMediaLibraryById(id);
    if (!exists) {
      throw new NotFoundException('Media library not found.');
    }

    await this.mediaLibraryRepository.delete(id);
  }
}
