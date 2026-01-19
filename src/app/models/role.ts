import { Permission } from "./permission";

export class Role {
    rolesId?: number;        
    code?: string;           
    roleName?: string;        
    discription?: string;     
    scope?: string;           
    permissions?: Permission; 
}
