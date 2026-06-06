import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Department } from 'src/app/models/department';
import { DepartmentService } from 'src/app/services/department.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { DialogboxComponent } from '../../dialogbox/dialogbox.component';
import { MatFormFieldModule } from "@angular/material/form-field"; // ✅ Import this

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css'],
})
export class DepartmentComponent implements OnInit {

  displayedColumns = ['name', 'code', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<Department>();
  departmentList: Department[] = [];

  departmentForm!: FormGroup;
  isEditMode = false;
  selectedDepartmentId?: number;
  currentPageNumber = 0;
  pageSize = 5;

  constructor(
    private deptService: DepartmentService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

 ngOnInit(): void {
  this.departmentForm = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    description: [''],
    isActive: [true]
  });

  this.reset();          // 👈 IMPORTANT
  this.loadDepartments();
}


  loadDepartments(): void {
    this.deptService.getAll().subscribe(res => {
      this.departmentList = res.dataList || [];
      this.syncCurrentPage();
      this.updateTableData();
    });
  }
  deleteDepartment(id:number){
    const dialogRef = this.dialog.open(DialogboxComponent, {
      width: '420px',
      disableClose: true,
      data: {
        title: 'Delete Department',
        message: 'Are you sure you want to delete this department?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.deptService.delete(id).subscribe(() => {
        this.loadDepartments();
      });
    });
  }
  openEdit(dept: Department): void {
    this.isEditMode = true;
    this.selectedDepartmentId = dept.id;
    this.departmentForm.patchValue(dept);
  }

  submit(): void {
    if (this.departmentForm.invalid) return;

    const payload = {
      ...this.departmentForm.value,
      id: this.selectedDepartmentId
    };

    const req$ = this.isEditMode
      ? this.deptService.updatedepartment(payload.id,payload)
      : this.deptService.createdepartment(payload);

    req$.subscribe(() => {
      this.loadDepartments();
      this.reset();
    });
  }

  reset(): void {
    this.departmentForm.reset({ isActive: true });
    this.isEditMode = false;
    this.selectedDepartmentId = undefined;
  }

  get totalRecords(): number {
    return this.departmentList.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get paginatedDepartments(): Department[] {
    const start = this.currentPageNumber * this.pageSize;
    return this.departmentList.slice(start, start + this.pageSize);
  }

  get pageRecords(): number {
    return this.paginatedDepartments.length;
  }

  goToPage(pageNumber: number): void {
    this.currentPageNumber = pageNumber;
    this.syncCurrentPage();
    this.updateTableData();
  }

  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPageNumber = 0;
    this.updateTableData();
  }

  private syncCurrentPage(): void {
    const lastPage = Math.max(this.totalPages - 1, 0);
    if (this.currentPageNumber > lastPage) {
      this.currentPageNumber = lastPage;
    }
  }

  private updateTableData(): void {
    this.dataSource.data = this.paginatedDepartments;
  }
}
