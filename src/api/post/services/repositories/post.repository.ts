import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../../shared/repository/base.repository';
import { PostModel, PostSearch } from './domain/post.domain';
import { Guid } from 'guid-typescript';
import { CosmosDBClient } from '../../../../shared/cosmos/cosmos-db.client';

@Injectable()
export class PostRepository extends BaseRepository<PostModel> {
  private readonly cosmos: CosmosDBClient;

  constructor() {
    super(process.env.DEEP_ART_COSMOS_DATABASE_POST);
    this.cosmos = new CosmosDBClient(process.env.DEEP_ART_COSMOS_DATABASE_POST);
  }

  public async getPostByIdAndUserId(
    postId: string,
    userId: string,
  ): Promise<PostModel> {
    const query = `select * from c where c.id = '${postId}' and c.userId = '${userId}'`;
    const post = await this.query(query);
    return post ? post[0] : null;
  }

  public async findPostByIdAndUserId(
    postId: string,
    userId: string,
  ): Promise<boolean> {
    const query = `select * from c where c.id = '${postId}' and c.userId = '${userId}'`;
    const post = await this.query(query);
    return post ? true : false;
  }

  public async findPostById(postId: string): Promise<PostModel> {
    const query = `select * from c where c.id = '${postId}'`;
    const posts = await this.query(query);
    return posts ? posts[0] : null;
  }

  public async findAllByUserId(userId: string): Promise<PostModel[]> {
    const query = `select * from c where c.userId = '${userId}'`;
    const posts = await this.cosmos.query(query);
    return posts ? (posts as Promise<PostModel[]>) : null;
  }

  public async search(search: PostSearch): Promise<PostModel[]> {
    let query = 'select * from c where c.isPublished = true';
    if (search.user != null) query += ` and c.username like '%${search.user}%'`;
    if (search.category != null)
      query += ` and ARRAY_CONTAINS(c.category, '${search.category}')`;

    const posts = await this.cosmos.query(query);
    return posts ? (posts as Promise<PostModel[]>) : null;
  }

  public createEntity(post: PostModel): PostModel {
    const newPost = new PostModel();
    newPost.id = Guid.create().toString();
    newPost.title = post.title;
    newPost.description = post.description;
    newPost.price = post.price ?? null;
    newPost.specialPrice = post.specialPrice ?? null;
    newPost.isPublished = post.isPublished ?? false;
    newPost.publishDate = post.publishDate ?? null;
    newPost.category = post.category ?? null;

    newPost.ipAddress = post.ipAddress ?? null;
    newPost.userAgent = post.userAgent ?? null;

    newPost.imageId = post.imageId ?? null;
    newPost.imageUrl = post.imageUrl ?? null;

    newPost.userId = post.userId;
    newPost.username = post.username;

    newPost.createdAt = new Date().toISOString();
    newPost.createdBy = 'SYSTEM';
    newPost.updatedAt = null;
    newPost.updatedBy = null;

    return newPost;
  }

  public updateEntity(oldPost: PostModel, newPost: PostModel): PostModel {
    newPost.id = oldPost.id;
    newPost.title = newPost.title ?? oldPost.title;
    newPost.description = newPost.description ?? oldPost.description;
    newPost.isPublished = newPost.isPublished ?? oldPost.isPublished;
    newPost.publishDate = newPost.publishDate ?? oldPost.publishDate;
    newPost.category = newPost.category ?? oldPost.category ?? [];
    newPost.price = newPost.price ?? oldPost.price;
    newPost.specialPrice = newPost.specialPrice ?? oldPost.specialPrice;
    newPost.ipAddress = newPost.ipAddress ?? oldPost.ipAddress;
    newPost.userAgent = newPost.userAgent ?? oldPost.userAgent;

    newPost.imageId = newPost.imageId ?? oldPost.imageId;
    newPost.imageUrl = newPost.imageUrl ?? oldPost.imageUrl;

    newPost.userId = newPost.userId ?? oldPost.userId;
    newPost.username = newPost.username ?? oldPost.username;

    newPost.createdAt = oldPost.createdAt;
    newPost.createdBy = oldPost.createdBy;
    newPost.updatedAt = new Date().toISOString();
    newPost.updatedBy = oldPost.userId;

    return newPost;
  }
}
