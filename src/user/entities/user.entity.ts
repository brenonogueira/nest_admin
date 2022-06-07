import { Users } from '.prisma/client';
export class User implements Users {
  id: number;
  email: string;
  password: string;
  first_name: string | null;
  last_name: string;
}
