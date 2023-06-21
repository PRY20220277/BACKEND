import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from '../../filters/http-exception.filter';
import { AuthService } from './auth.service';
import { AuthModel } from './auth.interface';

@Controller('users')
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/authenticate')
  public async login(@Body() auth: AuthModel) {
    return await this.authService.createToken(auth.username, auth.password);
  }
}
