import { Component, OnInit } from '@angular/core';
import { Department } from 'src/app/models/department';
import { DepartmentDialogComponent } from '../../department-dialog/department-dialog.component';
import { DepartmentService } from 'src/app/services/department.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';


@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {

  displayedColumns = ['name', 'description', 'isActive', 'actions'];
  departments: Department[] = [];
  dataSource = new MatTableDataSource<Department>();
  constructor(
    private deptService: DepartmentService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadDepartments();
  }
loadDepartments(): void {
  this.deptService.getAll().subscribe(res => {
    this.departments = res.dataList; // ✅ THIS IS THE ARRAY
  });
}


  openCreate(): void {
    this.openDialog();
  }

  openEdit(dept: Department): void {
    this.openDialog(dept);
  }

  delete(id: number): void {
    if (!confirm('Delete this department?')) return;

    this.deptService.delete(id).subscribe(() => {
      this.loadDepartments();
    });
  }

  private openDialog(dept?: Department): void {
    const dialogRef = this.dialog.open(DepartmentDialogComponent, {
      width: '400px',
      data: dept ?? null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDepartments();
      }
    });
  }

}
