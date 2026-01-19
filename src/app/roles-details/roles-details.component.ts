import { Component, OnInit } from '@angular/core';
import { Role } from '../models/role';
import { RoleserviceService } from '../services/role/roleservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-roles-details',
  templateUrl: './roles-details.component.html',
  styleUrls: ['./roles-details.component.css']
})
export class RolesDetailsComponent implements OnInit {
  role!: Role[];

  constructor(private roleService: RoleserviceService,
    private router: Router) { }

  ngOnInit(): void {
  }
  updaterole(id: number) {
    this.router.navigate(['update-employee', id]);
  }
  deleteRole(id: number) {
    this.roleService.deleteEmployee(id).subscribe(data => {
      this.roleService.getEmployee();
    })
  }

  fetchRoleDetails(id: number) {
    this.router.navigate(["employee-details", id]);
  }
}
