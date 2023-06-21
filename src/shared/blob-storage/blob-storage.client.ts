import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import axios from 'axios';
import { Util } from '../utils';

export class BlobStorageClient {
  private readonly blobClient: BlobServiceClient;
  private readonly containerClient: ContainerClient;
  private readonly util: Util;

  constructor() {
    this.blobClient = BlobServiceClient.fromConnectionString(
      process.env.DEEP_ART_BLOB_STORAGE_CS,
    );
    this.containerClient = this.blobClient.getContainerClient(
      process.env.DEEP_ART_BLOB_STORAGE_CN,
    );
    this.util = new Util();
  }

  async uploadFile(fileInfo: any): Promise<string> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(
      `${fileInfo.name}.${fileInfo.type}`,
    );
    await blockBlobClient.upload(fileInfo.file, fileInfo.length);
    return blockBlobClient.url;
  }

  async uploadFromURL(name: string, url: string): Promise<string> {
    const imageBuffer = await this.util.downloadFromURL(url);
    const blockBlobClient = this.containerClient.getBlockBlobClient(
      `${name}.webp`,
    );
    await blockBlobClient.upload(imageBuffer, imageBuffer.byteLength);
    return blockBlobClient.url;
  }

  async delete(name: string): Promise<boolean> {
    await this.containerClient.deleteBlob(name);
    return true;
  }
}
