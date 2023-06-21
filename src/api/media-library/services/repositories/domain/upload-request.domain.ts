export class UploadRequest {
  imageUrl?: string;
  youtubeUrl?: string;
  imageFile?: any;
  audioFile?: any;

  userId: string;
  username: string;

  ipAddress?: string;
  userAgent?: string;
}

export class DistortImageRequest {
  imageUrl: any;
  audioUrl: any;
  userId?: string;
  username?: string;
}

export class DownloadImageRequest {
  imageUrl: string;
  format: any;
  height: number;
  width: number;
}
