import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffuserServiceService } from 'src/app/services/staffuser-service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  staffForm!: FormGroup;
  hidePassword = true;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private staffService: StaffuserServiceService
  ) {}

  ngOnInit(): void {
    this.staffForm = this.fb.group({
      userName: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],

      mobileCode: ['+91', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],

      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      pincode: ['', Validators.required],

      departmentId: [null, Validators.required],
      staffType: ['', Validators.required],
      isActive: [true]
    });
  }

  submit(): void {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      console.error('FORM INVALID', this.staffForm.value);
      return;
    }

    this.submitting = true;

    const payload = this.staffForm.value;

    console.log('PAYLOAD SENT:', payload);

    this.staffService.createStaff(payload).subscribe({
      next: (res) => {
        console.log('STAFF CREATED', res);
        this.staffForm.reset({ isActive: true, mobileCode: '+91' });
        this.submitting = false;
      },
      error: (err) => {
        console.error('CREATE STAFF FAILED', err);
        this.submitting = false;
      }
    });
  }
}
