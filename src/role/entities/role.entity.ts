import { Roles } from '.prisma/client';

export class Role implements Roles {
  id: number;
  name: string;
}
