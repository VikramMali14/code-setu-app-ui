import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AccessMenuItem, AccessMenuSection, AccessMenuService } from 'src/app/services/access-menu.service';
import { ShowpopupService } from 'src/app/services/showpopup.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboardSections: AccessMenuSection[] = [];

  constructor(
    private router: Router,
    private accessMenuService: AccessMenuService,
    private showPopup: ShowpopupService
  ) {}

  ngOnInit(): void {
    this.dashboardSections = this.accessMenuService.getDashboardSections();
  }

  openModule(item: AccessMenuItem): void {
    if (item.comingSoon || !item.route) {
      this.showPopup.showInfo(`${item.label} module is currently under construction.`);
      return;
    }

    this.router.navigate([item.route]);
  }
}
