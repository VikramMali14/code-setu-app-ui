import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoleserviceService } from 'src/app/services/role/roleservice.service';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})
export class PermissionComponent implements OnInit {
  permissions: any[] = [];
  permissionForm!: FormGroup;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  selectedId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleserviceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadPermissions();
  }

  buildForm(): void {
    this.permissionForm = this.fb.group({
      name: ['', Validators.required],
      module: ['', Validators.required],
      code: [''],
      description: ['']
    });
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

  submitPermission(): void {
    if (this.permissionForm.invalid) {
      this.permissionForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.isSaving = true;

    const request = this.selectedId
      ? this.roleService.updatePermission(this.selectedId, payload)
      : this.roleService.createPermission(payload);

    request.subscribe({
      next: (res: any) => {
        this.isSaving = false;
        this.showMessage(res?.responseMessege || (this.selectedId ? 'Permission updated' : 'Permission created'));
        this.resetForm();
        this.loadPermissions();
      },
      error: () => {
        this.isSaving = false;
        this.showMessage('Permission save failed');
      }
    });
  }

  editPermission(permission: any): void {
    this.selectedId = this.getPermissionId(permission);
    this.permissionForm.patchValue({
      name: permission?.name || permission?.permissionName || permission?.label || '',
      module: permission?.module || '',
      code: permission?.code || permission?.key || permission?.permissionCode || '',
      description: permission?.description || permission?.discription || ''
    });
  }

  deletePermission(permission: any): void {
    const id = this.getPermissionId(permission);

    if (!id || !confirm('Delete this permission?')) {
      return;
    }

    this.roleService.deletePermission(id).subscribe({
      next: (res: any) => {
        this.showMessage(res?.responseMessege || 'Permission deleted');
        if (this.selectedId === id) {
          this.resetForm();
        }
        this.loadPermissions();
      },
      error: () => this.showMessage('Permission delete failed')
    });
  }

  resetForm(): void {
    this.selectedId = null;
    this.permissionForm.reset();
  }

  getPermissionId(permission: any): number {
    return permission?.id || permission?.permissionId || permission?.permissionsId || 0;
  }

  getPermissionName(permission: any): string {
    return permission?.name
      || permission?.label
      || permission?.permissionName
      || permission?.key
      || permission?.code
      || '-';
  }

  getPermissionCode(permission: any): string {
    return permission?.code
      || permission?.key
      || permission?.permissionCode
      || permission?.id
      || '-';
  }

  private buildPayload(): any {
    const raw = this.permissionForm.value;

    return {
      name: raw.name,
      module: raw.module,
      code: raw.code,
      description: raw.description
    };
  }

  private showMessage(message: string): void {
    this.snackBar.open(String(message), 'Close', { duration: 3000 });
  }
}
