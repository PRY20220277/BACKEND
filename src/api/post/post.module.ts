import { Module } from '@nestjs/common';
import { PostService } from './services/post.service';
import { PostController } from './controller/post.controller';
import { PostRepository } from './services/repositories/post.repository';
import { CosmosDBClient } from '../../shared/cosmos/cosmos-db.client';

@Module({
  controllers: [PostController],
  exports: [PostRepository, PostService],
  providers: [PostRepository, PostService],
})
export class PostModule {}
