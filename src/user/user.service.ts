import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Users as UserModel } from '.prisma/client';

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
      const usersCreate = await this.prisma.users.create({ data });

      delete usersCreate.password;

      return usersCreate;
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

  async paginate(page = 1): Promise<any> {
    const take = 1;

    const data = await this.prisma.users.findMany({
      take: take,
      skip: (page - 1) * take,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
      },
    });

    const total = await this.prisma.users.count();

    return {
      data,
      meta: {
        total: total,
        page: +page,
        last_page: Math.ceil(total / take),
      },
    };
  }

  async findOne(email: string): Promise<User> {
    return await this.prisma.users.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findOneById(id: number): Promise<any> {
    const user = await this.prisma.users.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        user_roles: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    // delete user.password;

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.prisma.users.update({
      where: {
        id: id,
      },
      data: {
        ...updateUserDto,
      },
    });

    return this.findOneById(id);
  }

  async remove(id: number) {
    return await this.prisma.users.delete({
      where: {
        id,
      },
    });
  }

  async addRole(body) {
    const userRoles = await this.prisma.users_Roles.findMany({
      where: {
        user_id: +body.user_id,
      },
    });

    const userHasRole = userRoles.some((e) => e.role_id == body.role_id);

    if (userHasRole === true) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: `O USUÁRIO JÁ POSSUI ESTA PERMISSÃO`,
        },
        HttpStatus.FORBIDDEN,
      );
    } else {
      const data = await this.prisma.users_Roles.create({
        data: {
          user_id: +body.user_id,
          role_id: +body.role_id,
        },
      });

      return data;
    }
  }
}
