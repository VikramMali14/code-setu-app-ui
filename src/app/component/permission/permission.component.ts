import { Component, OnInit } from '@angular/core';
import { RoleserviceService } from 'src/app/services/role/roleservice.service';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})
export class PermissionComponent implements OnInit {
  permissions: any[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private roleService: RoleserviceService) {}

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.roleService.getPermissions().subscribe({
      next: (res: any) => {
        const list = res?.dataList ?? res?.data ?? res ?? [];
        this.permissions = Array.isArray(list) ? list : [];
        this.isLoading = false;
      },
      error: () => {
        this.permissions = [];
        this.errorMessage = 'Unable to load permissions.';
        this.isLoading = false;
      }
    });
  }

  getPermissionName(permission: any): string {
    return permission?.label
      || permission?.permissionName
      || permission?.name
      || permission?.key
      || permission?.code
      || '-';
  }

  getPermissionCode(permission: any): string {
    return permission?.key
      || permission?.code
      || permission?.permissionCode
      || permission?.id
      || '-';
  }
}
