import { Module } from '@nestjs/common';
import { MediaLibraryService } from './services/media-library.service';
import { MediaLibraryController } from './controller/media-library.controller';
import { MediaLibraryRepository } from './services/repositories/media-library.repository';
import { CosmosDBClient } from '../../shared/cosmos/cosmos-db.client';

@Module({
  controllers: [MediaLibraryController],
  exports: [MediaLibraryRepository, MediaLibraryService],
  providers: [MediaLibraryRepository, MediaLibraryService],
})
export class MediaLibraryModule {}
