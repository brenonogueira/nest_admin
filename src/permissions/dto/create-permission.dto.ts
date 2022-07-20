import { IsNotEmpty, IsString } from 'class-validator';
import { Permission } from '../entities/permission.entity';

export class CreatePermissionDto extends Permission {
  @IsString()
  @IsNotEmpty()
  name: string;
}
