import { Injectable, NotFoundException } from '@nestjs/common';
import { PostModel, PostSearch } from './repositories/domain/post.domain';
import { ItemDefinition } from '@azure/cosmos';
import { PostRepository } from './repositories/post.repository';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  public async getAll(): Promise<ItemDefinition[]> {
    return await this.postRepository.fetchAll();
  }

  public async search(search: PostSearch): Promise<ItemDefinition[]> {
    return await this.postRepository.search(search);
  }

  public async getById(id: string): Promise<PostModel> {
    const post = await this.postRepository.findPostById(id);
    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    return post;
  }

  public async getAllByUserId(userId: string): Promise<PostModel[]> {
    const posts = await this.postRepository.findAllByUserId(userId);
    if (!posts.length) {
      throw new NotFoundException('User has no posts.');
    }

    return posts;
  }

  public async create(post: PostModel): Promise<PostModel> {
    const entity = this.postRepository.createEntity(post);
    const newPost = await this.postRepository.create(entity);
    return newPost;
  }

  public async update(id: string, post: PostModel): Promise<PostModel> {
    const oldPost = await this.postRepository.getPostByIdAndUserId(
      id,
      post.userId,
    );
    if (!oldPost) {
      throw new NotFoundException('Post doesnt belong to you.');
    }

    const newPost = this.postRepository.updateEntity(oldPost, post);
    await this.postRepository.update(id, newPost);

    return newPost;
  }

  public async delete(id: string) {
    const postExists = await this.postRepository.findPostById(id);
    if (!postExists) {
      throw new NotFoundException('Post not found.');
    }

    await this.postRepository.delete(id);
  }
}
