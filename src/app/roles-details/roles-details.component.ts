// roles-details.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { RoleserviceService } from '../services/role/roleservice.service';
import { ShowpopupService } from '../services/showpopup.service';
import { DialogboxComponent } from '../component/dialogbox/dialogbox.component';

@Component({
  selector: 'app-roles-details',
  templateUrl: './roles-details.component.html',
  styleUrls: ['./roles-details.component.css'] // Change 'roles.css' to the correct filename
})

export class RolesDetailsComponent implements OnInit {

  roleList: any[] = [];
  permissionList: any[] = [];

  // groupedPermissions: any = {};
  groupedPermissions: { [key: string]: any[] } = {};
  roleForm!: FormGroup;

  searchText = '';
  showForm = false;
  isEditMode = false;
  selectedId = 0;

  isLoading = false;
  currentPageNumber = 0;
  pageSize = 5;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleserviceService,
    private router: Router,
    private showpopup: ShowpopupService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.loadRoles();
    this.loadPermissions();
  }

  buildForm() {
    this.roleForm = this.fb.group({
      code: ['', Validators.required],
      roleName: ['', Validators.required],
      discription: [''],
      scope: ['', Validators.required],
      permissions: this.fb.group({})
    });
  }

  /* ===============================
      Load Roles
  =============================== */
  loadRoles() {
    this.roleService.getRole().subscribe({
      next: (res: any) => {
        this.roleList = res.dataList || res.data || [];
        this.syncCurrentPage();
      },
      error: err => console.error(err)
    });
  }

  /* ===============================
      Load Permissions
  =============================== */
  loadPermissions() {
    this.roleService.getPermissions().subscribe({
      next: (res: any) => {

        this.permissionList = res.dataList || [];

        this.groupByModule();

        this.createPermissionControls();
      },
      error: err => console.error(err)
    });
  }

  groupByModule() {

    this.groupedPermissions = {};

    this.permissionList.forEach(p => {

      const module = p.module || 'Other';

      if (!this.groupedPermissions[module]) {
        this.groupedPermissions[module] = [];
      }

      this.groupedPermissions[module].push(p);

    });
  }

  createPermissionControls() {

    const permissionGroup: any = {};

    this.permissionList.forEach(p => {
      permissionGroup[p.id] = [false];
    });

    this.roleForm.setControl(
      'permissions',
      this.fb.group(permissionGroup)
    );
  }

  /* ===============================
      Create New
  =============================== */
  openCreateForm() {

    this.showForm = true;
    this.isEditMode = false;
    this.selectedId = 0;

    this.roleForm.reset();

    this.createPermissionControls();
  }

  /* ===============================
      Edit
  =============================== */
  editRole(role: any) {

    this.showForm = true;
    this.isEditMode = true;
    this.selectedId = role.rolesId;

    this.roleForm.patchValue({
      code: role.code,
      roleName: role.roleName,
      discription: role.discription,
      scope: role.scope
    });

    this.createPermissionControls();

    if (role.permissions) {

      role.permissions.forEach((x: any) => {

        this.roleForm.get('permissions.' + x.id)
          ?.setValue(true);

      });
    }
  }

  /* ===============================
      Submit
  =============================== */
  submitForm() {

    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const raw = this.roleForm.value;

    const selectedPermissions =
      Object.keys(raw.permissions)
        .filter(id => raw.permissions[id] === true)
        .map(id => ({ id: +id }));

    const payload = {
      code: raw.code,
      roleName: raw.roleName,
      discription: raw.discription,
      scope: raw.scope,
      permissions: selectedPermissions
    };

    if (this.isEditMode) {

      const updatePayload = {
        rolesId: this.selectedId,
        ...payload
      };

      this.roleService.updateRole(updatePayload)
        .subscribe({
          next: (response: any) => {
            this.showpopup.showResponsePopup(
              response.responseMessege,
              response.responseCode
            ); 
            this.loadRoles();
            this.cancelForm();
          },
          error: err => console.error(err)
        });

    } else {

      this.roleService.createRole(payload)
        .subscribe({
           next: (response: any) => {
            this.showpopup.showResponsePopup(
              response.responseMessege,
              response.responseCode
            ); 
            this.loadRoles();
            this.cancelForm();
          },
          error: err => {
            console.error(err);
            this.showpopup.showResponsePopup(
              err.error?.message || 'Failed to create role. Please try again.',
              500
            );
          }
        });

    }
  }

  /* ===============================
      Delete
  =============================== */
  deleteRole(id: number) {
    const dialogRef = this.dialog.open(DialogboxComponent, {
      width: '420px',
      disableClose: true,
      data: {
        title: 'Delete Role',
        message: 'Are you sure you want to delete this role?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.roleService.deleteRole(id)
        .subscribe({
          next: () => this.loadRoles(),
          error: err => {
            console.error(err);
            this.showpopup.showResponsePopup(
              err.error?.message || 'Failed to delete role. Please try again.',
              500
            );
          }
        });
    });
  }

  /* ===============================
      Cancel
  =============================== */
  cancelForm() {
    this.showForm = false;
    this.roleForm.reset();
  }

  /* ===============================
      Search
  =============================== */
  filteredRoles() {
    return this.filteredRoleList;
  }

  get filteredRoleList(): any[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) return this.roleList;

    return this.roleList.filter(x =>
      x.roleName?.toLowerCase().includes(search) ||
      x.code?.toLowerCase().includes(search) ||
      x.scope?.toLowerCase().includes(search)
    );
  }

  get totalRecords(): number {
    return this.filteredRoleList.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get paginatedRoles(): any[] {
    const start = this.currentPageNumber * this.pageSize;
    return this.filteredRoleList.slice(start, start + this.pageSize);
  }

  get pageRecords(): number {
    return this.paginatedRoles.length;
  }

  onSearchChange(): void {
    this.currentPageNumber = 0;
  }

  goToPage(pageNumber: number): void {
    this.currentPageNumber = pageNumber;
    this.syncCurrentPage();
  }

  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPageNumber = 0;
  }

  private syncCurrentPage(): void {
    const lastPage = Math.max(this.totalPages - 1, 0);
    if (this.currentPageNumber > lastPage) {
      this.currentPageNumber = lastPage;
    }
  }

  toggleAllPermissions(event: any) {

    const checked = event.target.checked;

    Object.keys(this.roleForm.value.permissions)
      .forEach(id => {
        this.roleForm.get('permissions.' + id)
          ?.setValue(checked);
      });
  }
  toggleModule(moduleName: string, event: any) {

    const checked = event.target.checked;

    const list = this.groupedPermissions[moduleName];

    if (!list) return;

    list.forEach((x: any) => {

      this.roleForm.get('permissions.' + x.id)
        ?.setValue(checked);

    });
  }
}
