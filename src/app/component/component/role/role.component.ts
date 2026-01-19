import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { RoleserviceService } from 'src/app/services/role/roleservice.service';
import { PERMISSIONS } from 'src/app/models/permission';

@Component({
  selector: 'app-role',
  standalone: true,
  templateUrl: './role.component.html',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
  styleUrls: ['./role.component.css',]

})
export class RoleComponent implements OnInit {
  permissionsList = PERMISSIONS;
  private fb = inject(FormBuilder);

  roleForm = this.fb.group({
    code: ['', Validators.required],
    roleName: ['', [Validators.required, Validators.minLength(3)]],
    discription: [''],
    scope: [''],
    // Nested permissions group
   permissions: this.fb.group({
        CREATE_USER: [false],
        EDIT_USER: [false],
        DELETE_USER: [false],
        VIEW_REPORTS: [false]
      })
  });

  constructor(private roleservice: RoleserviceService) { }

  ngOnInit(): void {
  }
  onSubmit() {
    if (this.roleForm.valid) {
      this.roleservice.saveRole(this.roleForm.value).subscribe({
        next: response => {
          console.log('✅ Role saved successfully:', response);
          this.roleForm.reset();
        }
      })
    }
    console.log('Role Data:', this.roleForm.value);
  }
}


