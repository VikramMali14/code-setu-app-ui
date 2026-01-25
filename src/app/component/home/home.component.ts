import { Component, OnInit } from '@angular/core';
import { ContectUsComponent } from '../contect-us/contect-us.component';
import { PlanscreenComponent } from '../planscreen/planscreen.component';
import { DownloadscreenComponent } from '../downloadscreen/downloadscreen.component';
import { AboutComponent } from '../about/about.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { FeaturescreenComponent } from '../featurescreen/featurescreen.component';

@Component({
  selector: 'app-home',
    standalone: true,
    imports:[PlanscreenComponent,
      ContectUsComponent,
      DownloadscreenComponent,
      AboutComponent,
      DashboardComponent,
    FeaturescreenComponent],
  templateUrl: './home.component.html',
  
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
