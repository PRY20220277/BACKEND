import { BaseModel } from '../../../../../common/base-model';

export class MediaLibraryModel extends BaseModel {
  name: string;
  url: string;
  type: string;
  size: number;

  height?: number;
  width?: number;

  duration?: number;

  userId: string;
  username: string;

  ipAddress?: string;
  userAgent?: string;
}
