import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { Staff } from 'src/app/models/staff';
import { Router } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { StaffuserServiceService } from 'src/app/services/staffuser-service';


@Component({
  selector: 'app-staffuser',
  templateUrl: './staffuser.component.html',
  styleUrls: ['./staffuser.component.css']
})
export class StaffuserComponent implements OnInit {
  staffForm!: FormGroup;
  isSubmitting = false;

  selectedFile: File | null = null;
  previewImageUrl: string | null = null;
  uploadedImageUrl: string | null = null;
  uploadProgress: number = 0;
  uploadError: string | null = null;
  uploadSuccess: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private staffservice:StaffuserServiceService
  ) { }

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

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        this.uploadError = 'Only JPG and PNG images are allowed';
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.uploadError = 'File size must be less than 5MB';
        return;
      }

      this.selectedFile = file;
      this.uploadError = null;
      this.uploadSuccess = null;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);

      // Upload immediately
      this.uploadImage();
    }
  }
  uploadImage() {
    if (!this.selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.uploadProgress = 0;
    this.uploadError = null;
    this.uploadSuccess = null;
    this.staffservice.profileUpload(formData).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          // Calculate upload progress
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          // Upload completed
          this.uploadProgress = 100;
          this.uploadSuccess = 'Image uploaded successfully!';

          // Assuming the response contains the image URL
          // Adjust based on your API response structure
          if (event.body && event.body.imageUrl) {
            this.uploadedImageUrl = event.body.imageUrl;
            this.staffForm.patchValue({ profileImageUrl: this.uploadedImageUrl });
          } else if (event.body && event.body.url) {
            this.uploadedImageUrl = event.body.url;
            this.staffForm.patchValue({ profileImageUrl: this.uploadedImageUrl });
          }

          // Clear success message after 3 seconds
          setTimeout(() => {
            this.uploadSuccess = null;
            this.uploadProgress = 0;
          }, 3000);
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.uploadError = error.error?.message || 'Failed to upload image. Please try again.';
        this.uploadProgress = 0;
        this.previewImageUrl = null;
        this.selectedFile = null;
      }
    });
  }
  removeImage() {
    this.selectedFile = null;
    this.previewImageUrl = null;
    this.uploadedImageUrl = null;
    this.uploadProgress = 0;
    this.uploadError = null;
    this.uploadSuccess = null;
    this.staffForm.patchValue({ profileImageUrl: '' });

    // Reset file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}