import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../../shared/repository/base.repository';
import { UserModel } from './domain/user.domain';
import { Guid } from 'guid-typescript';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository extends BaseRepository<UserModel> {
  constructor() {
    super(process.env.DEEP_ART_COSMOS_DATABASE_USER);
  }

  public async getUserById(id: string): Promise<UserModel> {
    const query = `select * from c where c.id = '${id}'`;
    const user = await this.query(query);
    return user ? user[0] : null;
  }

  public async getByUsername(username: string): Promise<UserModel> {
    const query = `select * from c where c.username = '${username}'`;
    const user = await this.query(query);
    return user ? user[0] : null;
  }

  public async getByEmail(email: string): Promise<UserModel> {
    const query = `select * from c where c.email = '${email}'`;
    const user = await this.query(query);
    return user ? user[0] : null;
  }

  public async getByUsernameOrEmail(
    usernameOrEmail: string,
  ): Promise<UserModel> {
    const query = `select * from c where c.username = '${usernameOrEmail}' or c.email = '${usernameOrEmail}'`;
    const user = await this.query(query);
    return user ? user[0] : null;
  }

  public async usernameExists(username: string, id?: string): Promise<boolean> {
    let query = `select * from c where c.username = '${username}'`;
    if (id) {
      query += ` and c.id != ${id}`;
    }

    const user = await this.query(query);
    return user[0] ? true : false;
  }

  public async emailExists(email: string, id?: string): Promise<boolean> {
    let query = `select * from c where c.email = '${email}'`;
    if (id) {
      query += `and  c.id != ${id}`;
    }

    const user = await this.query(query);
    return user[0] ? true : false;
  }

  public async usernameOrEmailExists(
    usernameOrEmail: string,
  ): Promise<{ exists: boolean; field: string }> {
    const result = {
      field: null,
      exists: false,
    };

    const usernameExists = await this.usernameExists(usernameOrEmail);
    if (usernameExists) {
      result.field = 'username';
      result.exists = true;
    }

    const emailExists = await this.emailExists(usernameOrEmail);
    if (emailExists) {
      result.field = 'email';
      result.exists = true;
    }

    return result;
  }

  public async validateUsernameAndPassword(
    username: string,
    password: string,
  ): Promise<UserModel> {
    const query = `select * from c where c.username = '${username}' or c.email = '${username}'`;
    const user = await this.query(query);

    if (user && user[0]) {
      const isValid = await this.comparePassword(password, user[0].password);
      if (isValid) {
        return user[0];
      }
    }

    return null;
  }

  public async createEntity(user: UserModel): Promise<UserModel> {
    const newUser = new UserModel();
    newUser.id = Guid.create().toString();
    newUser.username = user.username;
    newUser.firstName = user.firstName;
    newUser.lastName = user.lastName;
    newUser.identification = user.identification;
    newUser.email = user.email;
    newUser.password = await this.encryptPassword(user.password);
    newUser.phoneNumber = user.phoneNumber;
    newUser.avatarUrl = user.avatarUrl;
    newUser.backgroundImageUrl = user.backgroundImageUrl;

    newUser.ipAddress = user.ipAddress;
    newUser.userAgent = user.userAgent;

    newUser.createdAt = new Date().toISOString();
    newUser.createdBy = 'SYSTEM';
    newUser.updatedAt = null;
    newUser.updatedBy = null;

    return newUser;
  }

  public async updateEntity(
    oldUser: UserModel,
    newUser: UserModel,
  ): Promise<UserModel> {
    newUser.id = oldUser.id;
    newUser.username = newUser.username ?? oldUser.username;
    newUser.firstName = newUser.firstName ?? oldUser.firstName;
    newUser.lastName = newUser.lastName ?? oldUser.lastName;
    newUser.identification = newUser.identification ?? oldUser.identification;
    newUser.email = newUser.email ?? oldUser.email;
    newUser.password =
      (await this.encryptPassword(newUser.password)) ?? oldUser.password;
    newUser.phoneNumber = newUser.phoneNumber ?? oldUser.phoneNumber;
    newUser.avatarUrl = newUser.avatarUrl ?? oldUser.avatarUrl;
    newUser.backgroundImageUrl =
      newUser.backgroundImageUrl ?? oldUser.backgroundImageUrl;

    newUser.ipAddress = newUser.ipAddress ?? oldUser.ipAddress;
    newUser.userAgent = newUser.userAgent ?? oldUser.userAgent;

    newUser.createdAt = oldUser.createdAt;
    newUser.createdBy = oldUser.createdBy;
    newUser.updatedAt = new Date().toISOString();
    newUser.updatedBy = newUser.id ?? oldUser.id;

    return newUser;
  }

  private async encryptPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  private async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<string> {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }
}
