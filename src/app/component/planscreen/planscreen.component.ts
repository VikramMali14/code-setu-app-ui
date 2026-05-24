import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PaginationComponent } from '../pagination/pagination.component';

// Define an interface for type safety (optional but recommended)
interface Plan {
  name: string;
  price: number;
  duration: string;
  features: string[];
  buttonText: string;
  colorClass: string;
}
// Define an interface for structured data
interface PaymentDetails {
  cgst: number;
  sgst: number;
  totalPayable: number;
}
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
    MatButtonModule,
    PaginationComponent
  ],
  styleUrls: ['./planscreen.component.css']
})

export class PlanscreenComponent implements OnInit {
  payment: PaymentDetails = { cgst: 0, sgst: 0, totalPayable: 0 };
  // Make these properties public so they can be accessed in the template
  public isPaymentModalVisible : boolean = false;
  public selectedPlan: Plan | null = null; // To hold the selected plan object
  currentPageNumber = 0;
  pageSize = 5;

  
  plans: Plan[] = [
    // ... your existing plans data ...
    {
      name: 'Silver Plan',
      price: 800,
      duration: '3 Month',
      features: ['Subscription Duration - 90-day', 'Create and Share - Unlimited Document', '24/7 Support'],
      buttonText: 'Subscribe Now',
      colorClass: 'grey lighten-4' // Custom color for design variation
    },
    {
      name: 'Gold Plan',
      price: 1551,
      duration: '6 Months',
      features: ['Subscription Duration - 180-day', 'Create and Share - Unlimited Document', '24/7 Support'],
      buttonText: 'Subscribe Now',
      colorClass: 'light-blue lighten-5' // Custom color for design variation
    },
    {
      name: 'Platinum Plan',
      price: 2999,
      duration: '12 month',
      features: ['Subscription Duration - 365-day', 'Create and Share - Unlimited Document', '24/7 Support'],
      buttonText: 'Subscribe Now',
      colorClass: 'grey lighten-4' // Custom color for design variation
    }
  ];
  constructor() { }

  ngOnInit(): void {
  }

  get totalRecords(): number {
    return this.plans.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get paginatedPlans(): Plan[] {
    const start = this.currentPageNumber * this.pageSize;
    return this.plans.slice(start, start + this.pageSize);
  }

  get pageRecords(): number {
    return this.paginatedPlans.length;
  }

  goToPage(pageNumber: number): void {
    this.currentPageNumber = pageNumber;
    this.syncCurrentPage();
  }

  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPageNumber = 0;
  }
    
  // Function to open the modal, now accepts the specific plan as an argument
  openPaymentModal(plan: Plan): void {

    this.selectedPlan = plan; // Set the selected plan
    this.isPaymentModalVisible = true;
    // You would integrate GST calculation logic here
      this.calculatePaymentBreakdown(this.selectedPlan.price); 

  }

  // Function to close the modal
  closePaymentModal(): void {
    this.isPaymentModalVisible = false;
    this.selectedPlan = null; // Clear the selected plan when closing
  }
calculatePaymentBreakdown(planPrice: number): void {
  const gstRate = 18; // Total GST Rate (18%)
  
  // 1. Calculate Total GST
  const totalGst = (planPrice * gstRate) / 100;

  // 2. Split for Intra-state (50% CGST, 50% SGST)
  this.payment.cgst = totalGst / 2;
  this.payment.sgst = totalGst / 2;

  // 3. Final Amount
  this.payment.totalPayable = planPrice + totalGst;
}

private syncCurrentPage(): void {
  const lastPage = Math.max(this.totalPages - 1, 0);
  if (this.currentPageNumber > lastPage) {
    this.currentPageNumber = lastPage;
  }
}
}

 
