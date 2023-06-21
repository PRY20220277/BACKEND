import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserService } from '../user/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from '../user/services/repositories/domain/user.domain';
import { Token } from './auth.interface';
import { EXPIRES_IN_HOURS } from '../../shared/configuration';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async createToken(usernameOrEmail: string, password: string): Promise<Token> {
    const user = await this.validateUsernameAndEmail(usernameOrEmail, password);
    const token = await this.jwtService.signAsync(user, { expiresIn: '7d' });
    return {
      access_token: token,
      expires_in: EXPIRES_IN_HOURS * 60 * 60 * 7,
      username: usernameOrEmail,
      id: user.id,
    };
  }

  async verifyToken(token: string): Promise<UserModel> {
    return await this.jwtService.verifyAsync(token);
  }

  private async validateUsernameAndEmail(
    username: string,
    password: string,
  ): Promise<UserModel> {
    const user = await this.userService.validateUsernameAndPassword(
      username,
      password,
    );
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
