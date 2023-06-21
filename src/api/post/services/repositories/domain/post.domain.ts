import { BaseModel } from '../../../../../common/base-model';

export class PostModel extends BaseModel {
  title: string;
  description: string;
  price?: number;
  specialPrice?: number;
  isPublished: boolean;
  publishDate?: string;
  category?: string[];

  userId: string;
  username: string;

  imageId?: string;
  imageUrl?: string;

  ipAddress?: string;
  userAgent?: string;
}

export class PostSearch {
  user: string;
  category: string;
}
