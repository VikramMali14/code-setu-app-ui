import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-contect-us',
    standalone: true, 

  templateUrl: './contect-us.component.html',
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule
  ],
  styleUrls: ['./contect-us.component.css']
})
export class ContectUsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
