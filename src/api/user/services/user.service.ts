import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserImageDto, UserModel } from './repositories/domain/user.domain';
import { ItemDefinition } from '@azure/cosmos';
import { UserRepository } from './repositories/user.repository';
import { AuthModel } from '../../auth/auth.interface';
import { BlobStorageClient } from '../../../shared/blob-storage/blob-storage.client';
import { Guid } from 'guid-typescript';
import { MediaLibraryRepository } from '../../media-library/services/repositories/media-library.repository';
import { MediaLibraryModel } from '../../media-library/services/repositories/domain/media-library.domain';

@Injectable()
export class UserService {
  private readonly blobStorageClient: BlobStorageClient;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly mediaLibraryRepository: MediaLibraryRepository,
  ) {
    this.blobStorageClient = new BlobStorageClient();
  }

  public async getAll(): Promise<ItemDefinition[]> {
    return await this.userRepository.fetchAll();
  }

  public async getById(id: string): Promise<UserModel> {
    try {
      const user = await this.userRepository.getUserById(id);
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  public async getByUsernameOrEmail(username: string): Promise<UserModel> {
    try {
      const user = await this.userRepository.getByUsernameOrEmail(username);
      if (!user) {
        throw new NotFoundException('Username not found.');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  public async validateUsernameAndPassword(
    username: string,
    password: string,
  ): Promise<UserModel> {
    try {
      const user = await this.userRepository.validateUsernameAndPassword(
        username,
        password,
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  public async create(user: UserModel): Promise<UserModel> {
    try {
      const usernameExists = await this.userRepository.usernameExists(
        user.username,
      );
      if (usernameExists) {
        throw new UnprocessableEntityException('Username already exists.');
      }

      const emailExists = await this.userRepository.emailExists(user.email);
      if (emailExists) {
        throw new UnprocessableEntityException('Email already exists.');
      }

      const entity = await this.userRepository.createEntity(user);
      const newUser = await this.userRepository.create(entity);
      await this.addDefaultSounds(newUser);

      return newUser;
    } catch (error) {
      throw error;
    }
  }

  public async update(id: string, user: UserModel): Promise<UserModel> {
    try {
      if (user.username) {
        const usernameExists = await this.userRepository.usernameExists(
          user.username,
          id,
        );
        if (usernameExists) {
          throw new UnprocessableEntityException('Username already exists.');
        }
      }

      const oldUser = await this.getById(id);
      const newUser = await this.userRepository.updateEntity(oldUser, user);
      await this.userRepository.update(id, newUser);

      return user;
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: string) {
    const userExists = await this.userRepository.getUserById(id);
    if (!userExists) {
      throw new NotFoundException('Username not found.');
    }

    await this.userRepository.delete(id);
  }

  public async resetPassword(auth: AuthModel) {
    const user = await this.userRepository.getByUsername(auth.username);
    if (!user) {
      throw new NotFoundException('Username not found.');
    }

    const newUser = new UserModel();
    newUser.password = auth.password;

    const newEntity = await this.userRepository.updateEntity(user, newUser);
    await this.userRepository.update(user.id, newEntity);

    return;
  }

  public async updateImage(id: string, file: any, field: string) {
    try {
      const user = await this.getById(id);
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      if (!file) {
        throw new NotFoundException('File not found.');
      }

      if (!['avatar', 'background'].includes(field)) {
        throw new NotFoundException('Image Type not found.');
      }

      const fileInfo = {
        name: Guid.create().toString(),
        file: file.buffer,
        type: 'webp',
        length: file.size,
      };

      const url = await this.blobStorageClient.uploadFile(fileInfo);
      const updatedField =
        field == 'avatar' ? 'avatarUrl' : 'backgroundImageUrl';
      user[updatedField] = url;

      return await this.userRepository.update(user.id, user);
    } catch (error) {
      throw error;
    }
  }

  public async addDefaultSounds(user: UserModel) {
    const defaultSounds = [
      {
        name: 'Opera',
        url: 'https://deepartstorage.blob.core.windows.net/files/1.mp3',
      },
      {
        name: 'Transito en la ciudad',
        url: 'https://deepartstorage.blob.core.windows.net/files/2.mp3',
      },
      {
        name: 'Techno',
        url: 'https://deepartstorage.blob.core.windows.net/files/3.mp3',
      },
      {
        name: 'Solo de Batería',
        url: 'https://deepartstorage.blob.core.windows.net/files/4.mp3',
      },
      {
        name: 'Sonidos ambientales',
        url: 'https://deepartstorage.blob.core.windows.net/files/5.mp3',
      },
    ];

    for (const defaultSound of defaultSounds) {
      const mediaLibrary = new MediaLibraryModel();
      mediaLibrary.url = defaultSound.url;
      mediaLibrary.name = defaultSound.name;
      mediaLibrary.size = 500000;
      mediaLibrary.type = 'mp3';
      mediaLibrary.userId = user.id;
      mediaLibrary.username = user.username;
      mediaLibrary.ipAddress = user.ipAddress ?? null;
      mediaLibrary.userAgent = user.userAgent ?? null;

      const entity = this.mediaLibraryRepository.createEntity(mediaLibrary);
      await this.mediaLibraryRepository.create(entity);
    }
  }
}
