import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { Staff } from 'src/app/models/staff';
import { Router } from '@angular/router';


@Component({
  selector: 'app-staffuser',
  templateUrl: './staffuser.component.html',
  styleUrls: ['./staffuser.component.css']
})
export class StaffuserComponent implements OnInit {
  staffForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadStaffData(); // Load existing data if available
  }

  initializeForm() {
    this.staffForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      mobileCode: ['+91'],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      country: ['India'],
      state: [''],
      city: [''],
      address: [''],
      pincode: [null, [Validators.pattern('^[0-9]{6}$')]],
      departmentId: [null],
      staffType: ['STAFF', Validators.required],
      isActive: [true],
      dob: [null]
    });
  }

  loadStaffData() {
    // Load existing staff data from service or route params
    // Example: Get from localStorage or API
    const savedData = localStorage.getItem('currentStaff');
    if (savedData) {
      const staffData = JSON.parse(savedData);
      this.staffForm.patchValue(staffData);
    }
  }

  onSubmit() {
    if (this.staffForm.valid) {
      this.isSubmitting = true;

      console.log('Updated Staff Data:', this.staffForm.value);

      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        alert('Staff profile updated successfully!');
        // this.router.navigate(['/staff-list']);
      }, 1500);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.staffForm.controls).forEach(key => {
        this.staffForm.get(key)?.markAsTouched();
      });
    }
  }

  onReset() {
    if (confirm('Are you sure you want to reset the form? All unsaved changes will be lost.')) {
      this.staffForm.reset({
        mobileCode: '+91',
        country: 'India',
        staffType: 'STAFF',
        isActive: true
      });
    }
  }
}