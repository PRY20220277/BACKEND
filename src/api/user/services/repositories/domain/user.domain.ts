import { BaseModel } from '../../../../../common/base-model';

export class UserModel extends BaseModel {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  identification: string;
  phoneNumber: string;
  avatarUrl: string;
  backgroundImageUrl: string;
  ipAddress?: string;
  userAgent?: string;
  // roles: Array<string>;
}

export class UserImageDto {
  id: string;
  file: any;
}
