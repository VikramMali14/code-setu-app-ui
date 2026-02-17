import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GenericDataDTO } from 'src/app/models/generic-data-dto';
import { Plandto } from 'src/app/models/plandto';
import { PlanserviceService } from 'src/app/services/planservice.service';
import { ShowpopupService } from 'src/app/services/showpopup.service';

@Component({
  selector: 'app-createplan',
  templateUrl: './createplan.component.html',
  styleUrls: ['./createplan.component.css']
})
export class CreateplanComponent implements OnInit {
  planForm!: FormGroup;
  plans: Plandto[] = [];
  selectedPlan: Plandto | null = null;
  planToDelete: Plandto | null = null;
  isEditMode = false;
  successMessage = '';
  constructor(private fb: FormBuilder,
    private planservice: PlanserviceService,
    private showPopup:ShowpopupService
  ) { }

  ngOnInit(): void {
    this.planForm = this.fb.group({
      planId: [null],
      name: ['', Validators.required],
      plannCategory: ['', Validators.required],
      planValidity: [null, Validators.required],
      price: [0, [Validators.required, Validators.min(0)]]
    });

    this.loadPlans(); // 👈 add this
  }

  // 👇 THIS FIXES YOUR ERROR
  get f() {
    return this.planForm.controls;
  }

loadPlans(): void {
  this.planservice.getPlanList().subscribe({
    next: (response: Plandto[]) => {
      console.log("Plans Loaded:", response);
      this.plans = response;
    },
    error: (err) => {
      console.error("Error loading plans:", err);
    }
  });
}


  selectPlan(plan: Plandto): void {
    this.selectedPlan = plan;
  }



  editPlan(plan: Plandto): void {
    this.isEditMode = true;
    this.selectedPlan = plan;
    this.planForm.patchValue(plan);
    this.planToDelete = null; // Hide delete confirmation if open
    this.successMessage = ''; // Clear success message

    // Scroll to form on mobile
    if (window.innerWidth < 1024) {
      document.querySelector('.plan-form-panel')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  confirmDelete(plan: Plandto): void {
    this.planToDelete = plan;
    this.successMessage = ''; // Clear success message

    // Scroll to confirmation on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.querySelector('.delete-confirmation')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  cancelDelete(): void {
    this.planToDelete = null;
  }

deletePlan(): void {
  if (!this.planToDelete) return;

  const planId = this.planToDelete.planId;

  this.planservice.deletePlane(planId).subscribe({
    next: (response) => {

      this.showPopup.showResponsePopup(
        response.responseMessege,
        response.responseCode
      );

      // Remove deleted plan from UI
      this.plans = this.plans.filter(p => p.planId !== planId);

      // Reset state
      this.planToDelete = null;
      this.selectedPlan = null;
    },
    error: (err) => {
      console.error("Delete Error:", err);
    }
  });
}


  createNewPlan(): void {
    this.isEditMode = false;
    this.selectedPlan = null;
    this.planForm.reset();
    this.planToDelete = null; // Hide delete confirmation
    this.successMessage = ''; // Clear success message

    // Scroll to form on mobile
    if (window.innerWidth < 1024) {
      document.querySelector('.plan-form-panel')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onSubmit(): void {

  if (this.planForm.invalid) {
    this.planForm.markAllAsTouched();
    return;
  }

  const planData = this.planForm.value;

  if (this.isEditMode) {

    this.planservice.updatePlane(planData.planId, planData).subscribe({
      next: (response: GenericDataDTO) => {

        this.showPopup.showResponsePopup(
          response.responseMessege,
          response.responseCode
        );

        this.loadPlans();     // refresh table
        this.createNewPlan(); // reset form AFTER success
      },
      error: (err) => console.error("Update Error:", err)
    });

  } else {

    this.planservice.createPlane(planData).subscribe({
      next: (response: GenericDataDTO) => {

        this.showPopup.showResponsePopup(
          response.responseMessege,
          response.responseCode
        );

        this.loadPlans();     // refresh table
        this.createNewPlan(); // reset form AFTER success
      },
      error: (err) => console.error("Create Error:", err)
    });
  }
}



  onCancel(): void {
    this.planForm.reset();
    this.isEditMode = false;
    this.selectedPlan = null;
    this.planToDelete = null;
    this.successMessage = '';
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
  isPlanActive(plan: any): boolean {
    const today = new Date();
    const validityDate = new Date(plan.planValidity);
    return validityDate >= today;
  }
}
