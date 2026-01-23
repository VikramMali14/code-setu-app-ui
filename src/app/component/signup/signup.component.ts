import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounce } from 'rxjs';
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
  ) { }

  ngOnInit(): void {
    this.staffForm = this.fb.group({

      // STEP 1
      basicInfo: this.fb.group({
        userName: ['', Validators.required],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        password: ['', Validators.required],
        dob: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
      }),

      // STEP 2
      addressInfo: this.fb.group({
        country: ['', Validators.required],
        state: ['', Validators.required],
        city: ['', Validators.required],
        address: ['', Validators.required],
        pincode: ['', Validators.required]
      }),

      // STEP 3
      otherInfo: this.fb.group({
        mobileCode: ['+91', Validators.required],
        mobileNumber: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{10}$')]
        ],
        departmentId: [null, Validators.required],
        staffType: ['', Validators.required],
        isActive: [true],

        // future-proof
        dob: [null],
        gender: ['']
      })
    });
  }

  submit(): void {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.staffForm.value.basicInfo,
      ...this.staffForm.value.addressInfo,
      ...this.staffForm.value.otherInfo,
    };

    console.log('FINAL PAYLOAD', payload);

    this.submitting = true;

    this.staffService.createStaff(payload).subscribe({
      next: (res) => {
        console.log('STAFF CREATED', res);
        this.staffForm.reset({
          otherInfo: { isActive: true, mobileCode: '+91' }
        });
        this.submitting = false;
      },
      error: (err) => {
        console.error('CREATE STAFF FAILED', err);
        this.submitting = false;
      }
    });
  }
  get basicInfoForm(): FormGroup {
    return this.staffForm.get('basicInfo') as FormGroup;
  }

  get addressInfoForm(): FormGroup {
    return this.staffForm.get('addressInfo') as FormGroup;
  }

  get otherInfoForm(): FormGroup {
    return this.staffForm.get('otherInfo') as FormGroup;
  }

}
