import { Component, OnInit } from '@angular/core';
import { Role } from 'src/app/models/role';
import { RoleserviceService } from 'src/app/services/role/roleservice.service';
import { Router, RouterModule, Routes, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-updaterole',
  templateUrl: './updaterole.component.html',
  styleUrls: ['./updaterole.component.css']
})
export class UpdateroleComponent implements OnInit {

  id!: number;
  role: Role = new Role();
  constructor(private roleservice: RoleserviceService,
    private actiavtedroute: ActivatedRoute,
    private router: Router
  ) { }


  onSubmit() {
    console.log(this.role);
    this.updateEmployee();

  }
  updateEmployee() {
    this.roleservice
      .updaterols(this.role)
      .subscribe(data => {
        this.gotoService(),
          console.log(this.role);
      })
  }
  ngOnInit(): void {
    this.id = this.actiavtedroute.snapshot.params["id"];
    this.roleservice.getroleById(this.id)
      .subscribe({
        next: response => {
          this.role = response;
          console.log('Employee fetched:', this.role);
        },
        error: err => console.error(err)
      });
  }
  gotoService() {
    this.router.navigate(["/role"]);
  }
}
