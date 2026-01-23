import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Department } from 'src/app/models/department';
import { DepartmentService } from 'src/app/services/department.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-department-dialog',
  templateUrl: './department-dialog.component.html',
  styleUrls: ['./department-dialog.component.css']
})
export class DepartmentDialogComponent implements OnInit {

    ngOnInit() {
  }

form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private deptService: DepartmentService,
    private dialogRef: MatDialogRef<DepartmentDialogComponent>
,
    @Inject(MAT_DIALOG_DATA) public data: Department | null
  ) {
    this.isEdit = !!data;

    this.form = this.fb.group({
      name: ['', Validators.required],
      code:[''],
      description: [''],
      isActive: [true]
    });

    if (data) {
      this.form.patchValue(data);
    }
  }

save(): void {
  if (this.form.invalid) return;

  const payload = this.form.value;

  const request$ = this.isEdit
    ? this.deptService.updatedepartment( payload)
    : this.deptService.createdepartment(payload);

  // FIXED: Removed '.Observable'
  request$.subscribe(() => {
    this.dialogRef.close(true);
  });
}
onCancel(): void {
  this.dialogRef.close();
}
}
