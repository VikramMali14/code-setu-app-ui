import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Department } from 'src/app/models/department';
import { DepartmentService } from 'src/app/services/department.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {

  displayedColumns = ['name', 'description', 'isActive', 'actions'];
  departments: Department[] = [];

  dataSource = new MatTableDataSource<Department>();

  departmentForm!: FormGroup;
  isEditMode = false;
  selectedDepartmentId?: number;

  constructor(
    private deptService: DepartmentService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadDepartments();
  }

  private initForm(): void {
    this.departmentForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],

      description: [''],
      isActive: [true, Validators.required]
    });
  }

  loadDepartments(): void {
    this.deptService.getAll().subscribe(res => {
      this.departments = res.dataList;
      this.dataSource.data = this.departments;
    });
  }

  /** CREATE */
  openCreate(): void {
    this.isEditMode = false;
    this.selectedDepartmentId = undefined;
    this.departmentForm.reset({ isActive: true });
  }

  /** EDIT */
  openEdit(dept: Department): void {
    this.isEditMode = true;
    this.selectedDepartmentId = dept.id;

    this.departmentForm.patchValue({
      name: dept.name,
      description: dept.description,
      isActive: dept.isActive
    });
  }

  /** SAVE (CREATE or UPDATE) */
  submit(): void {
    if (this.departmentForm.invalid) return;

    const payload: Department = {
      ...this.departmentForm.value,
      id: this.selectedDepartmentId
    };

    const api$ = this.isEditMode
      ? this.deptService.updatedepartment(payload)
      : this.deptService.createdepartment(payload);

    api$.subscribe(() => {
      this.loadDepartments();
      this.reset();
    });
  }

  reset(): void {
    this.isEditMode = false;
    this.selectedDepartmentId = undefined;
    this.departmentForm.reset({ isActive: true });
  }

  delete(id: number): void {
    if (!confirm('Delete this department?')) return;

    this.deptService.delete(id).subscribe(() => {
      this.loadDepartments();
    });
  }
}
