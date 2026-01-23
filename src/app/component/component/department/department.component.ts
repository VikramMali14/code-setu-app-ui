import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Department } from 'src/app/models/department';
import { DepartmentService } from 'src/app/services/department.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from "@angular/material/form-field"; // ✅ Import this

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css'],
})
export class DepartmentComponent implements OnInit {

  displayedColumns = ['name', 'code', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<Department>();

  departmentForm!: FormGroup;
  isEditMode = false;
  selectedDepartmentId?: number;

  constructor(
    private deptService: DepartmentService,
    private fb: FormBuilder
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
      this.dataSource.data = res.dataList;
    });
  }
  deleteDepartment(id:number){
    this.deptService.delete(id);
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
}
