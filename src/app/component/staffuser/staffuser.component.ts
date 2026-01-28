import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { Staff } from 'src/app/models/staff';
import { Router } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { StaffuserServiceService } from 'src/app/services/staffuser-service';
import { GenericDataDTO } from 'src/app/models/generic-data-dto';
import { ShowpopupService } from 'src/app/services/showpopup.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';


@Component({
  selector: 'app-staffuser',
  templateUrl: './staffuser.component.html',
  styleUrls: ['./staffuser.component.css']
})
export class StaffuserComponent implements OnInit {
  imagePreview: string | null = null;
  staffForm!: FormGroup;
  isSubmitting = false;
  selectedFile: File | null = null;
  previewImageUrl: string | null = null;
  uploadedImageUrl: string | null = null;
  uploadProgress: number = 0;
  uploadError: string | null = null;
  uploadSuccess: string | null = null;
  imageChangedEvent: any = '';
  croppedImage: any = ''; // Preview of the cropped version
  showCropper = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private staffservice: StaffuserServiceService,
    private cd: ChangeDetectorRef,
    private shoepopup: ShowpopupService
  ) {
    this.initializeForm();

    // Get navigation from Router
    const navigation = this.router.getCurrentNavigation();

    // Try to get data from Router State OR History API fallback
    const receivedData = navigation?.extras.state?.['staffData'] || history.state?.['staffData'];

    if (receivedData) {
      console.log('Data received, patching...', receivedData);
      // Use a small timeout to ensure the form is fully ready in the DOM
      setTimeout(() => {
        this.patchStaffData(receivedData);
      });
    }
  }



  ngOnInit() {
    if (this.staffForm.pristine) {
      this.loadStaffData();
    }
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
      this.staffservice.updateStaff(this.staffForm).subscribe({
        next: (response: GenericDataDTO) => {
          this.shoepopup.showResponsePopup(response.responseMessege, response.responseCode)
        }
      })
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

  // onFileSelected(event: any) {
  //   const file = event.target.files[0];

  //   if (file) {
  //     // Validate file type
  //     const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  //     if (!allowedTypes.includes(file.type)) {
  //       this.uploadError = 'Only JPG and PNG images are allowed';
  //       return;
  //     }

  //     // Validate file size (5MB max)
  //     const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  //     if (file.size > maxSize) {
  //       this.uploadError = 'File size must be less than 5MB';
  //       return;
  //     }

  //     this.selectedFile = file;
  //     this.uploadError = null;
  //     this.uploadSuccess = null;

  //     // Create preview
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       this.previewImageUrl = e.target.result;
  //     };
  //     reader.readAsDataURL(file);

  //     // Upload immediately
  //     this.uploadImage();
  //   }
  // }
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
  patchStaffData(data: any) {
    // Map the API data to your Form Controls
    this.staffForm.patchValue({

      userName: data.userName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobileCode: data.mobileCode,
      mobileNumber: data.mobileNumber,
      state: data.state,
      city: data.city,
      address: data.address,
      pincode: data.pincode,
      staffType: data.staffType,
      isActive: data.isActive
    });
    this.cd.detectChanges(); // Force UI update


    // Set profile image preview if URL exists
    if (data.profileImageUrl) {
      this.imagePreview = `http://localhost:8080/images/${data.profileImageUrl}`;
    }
  }
  nFileSelected(event: any): void {
    this.imageChangedEvent = event;
    this.showCropper = true; // Show cropper UI
  }

  imageCropped(event: ImageCroppedEvent) {
    // 1. Set preview using the base64 string
    this.croppedImage = event.base64;

    // 2. Convert Base64 to a Blob/File for Spring Boot
    if (event.base64) {
      const blob = this.base64ToBlob(event.base64);
      this.selectedFile = new File([blob], "profile.png", { type: 'image/png' });
    }
  }

  confirmCrop() {
    this.showCropper = false;
    this.previewImageUrl = this.croppedImage; // Update UI avatar
    this.uploadImage(); // Call your existing Spring Boot upload method
  }
  // Helper method to convert base64 to Blob
  private base64ToBlob(base64: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([int8Array], { type: 'image/png' });
  }
  // Replace your old onFileSelected and add the handler
onFileSelected(event: any) {
  if (event.target.files && event.target.files[0]) {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }
}

handleCroppedImage(file: File) {
  this.showCropper = false;
  this.selectedFile = file;

  // Set local preview for the form
  const reader = new FileReader();
  reader.onload = (e: any) => this.previewImageUrl = e.target.result;
  reader.readAsDataURL(file);

  // Trigger your Spring Boot upload logic
  this.uploadImage();
}

}