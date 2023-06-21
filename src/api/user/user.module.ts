import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controller/user.controller';
import { UserRepository } from './services/repositories/user.repository';
import { MediaLibraryModule } from '../media-library/media-library.module';

@Module({
  controllers: [UserController],
  exports: [UserService, UserRepository],
  providers: [UserService, UserRepository],
  imports: [MediaLibraryModule],
})
export class UserModule {}
