import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateUserDto) {
    if (body.password !== body.password_confirmation) {
      throw new BadRequestException('Passwords do not match');
    } else {
      delete body.password_confirmation;
    }

    const hashed = await bcrypt.hash(body.password, 10);

    const data = {
      ...body,
      password: hashed,
    };
    try {
      return await this.prisma.users.create({ data });
    } catch (error) {
      if (error.meta.target[0] === 'email') {
        throw new BadRequestException('Email já cadastrado');
      }
      // return error.meta.target;
    }
  }

  async findAll(): Promise<User[]> {
    return await this.prisma.users.findMany();
  }

  async findOne(email: string): Promise<User> {
    return await this.prisma.users.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });

    delete user.password;

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
