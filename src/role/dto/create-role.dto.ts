import { IsString } from 'class-validator';
import { Role } from '../entities/role.entity';

export class CreateRoleDto extends Role {
  @IsString()
  name: string;
}
