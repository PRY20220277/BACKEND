import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../../shared/repository/base.repository';
import { MediaLibraryModel } from './domain/media-library.domain';
import { Guid } from 'guid-typescript';
import { CosmosDBClient } from '../../../../shared/cosmos/cosmos-db.client';

@Injectable()
export class MediaLibraryRepository extends BaseRepository<MediaLibraryModel> {
  private readonly cosmos: CosmosDBClient;

  constructor() {
    super(process.env.DEEP_ART_COSMOS_DATABASE_MEDIA_LIBRARY);
    this.cosmos = new CosmosDBClient(
      process.env.DEEP_ART_COSMOS_DATABASE_MEDIA_LIBRARY,
    );
  }

  public async findMediaLibraryById(
    mediaLibraryId: string,
  ): Promise<MediaLibraryModel> {
    const query = `select * from c where c.id = '${mediaLibraryId}'`;
    const mediaLibraries = await this.query(query);
    return mediaLibraries ? mediaLibraries[0] : null;
  }

  public async getAllByUserId(userId: string): Promise<MediaLibraryModel[]> {
    const query = `select * from c where c.userId = '${userId}'`;
    const mediaLibraries = await this.cosmos.query(query);
    return mediaLibraries ? (mediaLibraries as MediaLibraryModel[]) : null;
  }

  public createEntity(mediaLibrary: MediaLibraryModel): MediaLibraryModel {
    const newEntity = new MediaLibraryModel();
    newEntity.id = Guid.create().toString();
    newEntity.name = mediaLibrary.name;
    newEntity.url = mediaLibrary.url;
    newEntity.type = mediaLibrary.type ?? null;

    newEntity.height = mediaLibrary.height ?? null;
    newEntity.width = mediaLibrary.width ?? null;

    newEntity.duration = mediaLibrary.duration ?? null;
    newEntity.size = mediaLibrary.size ?? null;

    newEntity.userId = mediaLibrary.userId;
    newEntity.username = mediaLibrary.username;

    newEntity.ipAddress = mediaLibrary.ipAddress ?? null;
    newEntity.userAgent = mediaLibrary.userAgent ?? null;

    newEntity.createdAt = new Date().toISOString();
    newEntity.createdBy = 'SYSTEM';
    newEntity.updatedAt = null;
    newEntity.updatedBy = null;

    return newEntity;
  }
}
