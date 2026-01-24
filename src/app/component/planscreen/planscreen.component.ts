import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-planscreen',
  templateUrl: './planscreen.component.html',
  standalone:true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule
  ],
  styleUrls: ['./planscreen.component.css']
})
export class PlanscreenComponent implements OnInit {
 plans = [
    {
      name: 'Silver Plan',
      price: '₹800',
      duration: '3 Month',
      features: ['Subscription Duration - 90-day', 'Create and Share - Unlimited Document', '24/7 Support'],
      buttonText: 'Subscribe Now',
      colorClass: 'grey lighten-4' // Custom color for design variation
    },
    {
      name: 'Gold Plan',
      price: '₹1551',
      duration: '6 Months',
      features: ['Subscription Duration - 180-day', 'Create and Share - Unlimited Document', '24/7 Support'],
      buttonText: 'Subscribe Now',
      colorClass: 'light-blue lighten-5' // Custom color for design variation
    },
    {
      name: 'Platinum Plan',
      price: '₹2999',
      duration: '12 month',
      features: ['Subscription Duration - 365-day', 'Create and Share - Unlimited Document', '24/7 Support'],
      buttonText: 'Subscribe Now',
      colorClass: 'grey lighten-4' // Custom color for design variation
    }
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
