import { Permissions } from '.prisma/client';

export class Permission implements Permissions {
  id: number;
  name: string;
}
