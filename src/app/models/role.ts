import { Permission } from "./permission";

export class Role {

  rolesId!: number;

  code!: string;

  roleName!: string;

  description?: string;

  scope!: string;

  permissions!: Permission[];

}