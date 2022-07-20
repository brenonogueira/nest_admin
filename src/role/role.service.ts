import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateRoleDto, permissions) {
    return this.prisma.roles.create({
      data: {
        name: data.name,
        role_permissions: {
          create: [{ permission_id: permissions }],
        },
      },
    });
  }

  async findAll(): Promise<Role[]> {
    return await this.prisma.roles.findMany();
  }

  findOne(id: number) {
    return this.prisma.roles.findUnique({
      where: {
        id: id,
      },
    });
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return this.prisma.roles.update({
      where: {
        id: id,
      },
      data: updateRoleDto,
    });
  }

  remove(id: number) {
    return this.prisma.roles.delete({
      where: {
        id: id,
      },
    });
  }
}
