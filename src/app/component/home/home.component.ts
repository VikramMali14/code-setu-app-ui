import { Component, OnInit } from '@angular/core';
import { ContectUsComponent } from '../contect-us/contect-us.component';

@Component({
  selector: 'app-home',
    standalone: true,
    imports:[ContectUsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
