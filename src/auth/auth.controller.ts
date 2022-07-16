import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { AuthGuard } from './auth.guard';

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

    delete user.password;
    return user;
  }

  @UseGuards(AuthGuard)
  @Get('user')
  async user(@Req() request: Request) {
    // Get JWT from cookie
    const cookie = request.cookies['jwt'];

    //Get data from cookie
    const data = await this.jwtService.verifyAsync(cookie);

    return this.userService.findOneById(data.id);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');

    return {
      message: 'Logged out',
    };
  }
}
