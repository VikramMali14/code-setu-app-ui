import { Component, OnInit } from '@angular/core';
import { ContectUsComponent } from '../contect-us/contect-us.component';
import { PlanscreenComponent } from '../planscreen/planscreen.component';
import { DownloadscreenComponent } from '../downloadscreen/downloadscreen.component';

@Component({
  selector: 'app-home',
    standalone: true,
    imports:[PlanscreenComponent,ContectUsComponent,DownloadscreenComponent],
  templateUrl: './home.component.html',
  
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
