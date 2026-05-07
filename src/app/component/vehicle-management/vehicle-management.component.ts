import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './vehicle-management.component.html',
  styleUrls: ['./vehicle-management.component.css']
})
export class VehicleManagementComponent {
  cards = [
    {
      icon: 'local_shipping',
      title: 'Vehicles',
      description: 'Manage all vehicles',
      route: '/vehicle-management/vehicles'
    },
    {
      icon: 'person',
      title: 'Drivers',
      description: 'Manage all drivers',
      route: '/vehicle-management/drivers'
    },
    {
      icon: 'link',
      title: 'Assignments',
      description: 'Assign vehicle to driver',
      route: '/vehicle-management/assignments'
    }
  ];
}
