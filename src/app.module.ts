import { Module } from '@nestjs/common';
import { UserModule } from './api/user/user.module';
import { AuthModule } from './api/auth/auth.module';
import { PostModule } from './api/post/post.module';
import { MediaLibraryModule } from './api/media-library/media-library.module';

@Module({
  imports: [MediaLibraryModule, PostModule, UserModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
