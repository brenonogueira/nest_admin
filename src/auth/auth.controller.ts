import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  Res,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return await this.userService.create(body);
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Check if user exists
    const user = await this.userService.findOne(email);

    //If user does not exist, throw error
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if password is correct
    if (!(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid Credentials');
    }

    // Return JWT
    const jwt = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
    });

    // Set JWT in cookie
    response.cookie('jwt', jwt, {
      httpOnly: true,
    });

    return user;
  }
}
