import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from 'src/app/services/company.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent implements OnInit {


  company: any = null;
  isLoading = false;
 companyForm!: FormGroup;
  isEditMode = false;


  constructor(private companyService: CompanyService,
    private fb: FormBuilder,
  ) { }

   ngOnInit(): void {
    this.buildForm();
  }

  loadCompanies() {
    this.isLoading = true;

    this.companyService.getCompany().subscribe({
      next: (res: any) => {
        this.company =
          res.dataList ||
          res.data ||
          [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Company list error', err);
        this.isLoading = false;
      }
    });
  }
  submit() {

    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    const payload = this.companyForm.value;

    if (this.isEditMode) {

      this.companyService.updateCompany(payload).subscribe({
        next: () => {
          alert('Company Updated Successfully');
          this.loadCompanies();
        }
      });

    } else {

      this.companyService.createCompany(payload).subscribe({
        next: () => {
          alert('Company Created Successfully');
          this.loadCompanies();
        }
      });

    }
  }
    buildForm() {
    this.companyForm = this.fb.group({
      companyId: [''],
      companyName: ['', Validators.required],
      companyEmail: ['', [Validators.required, Validators.email]],
      whatsappNumber: [''],
      contactNo1: [''],
      contactNo2: [''],
      landlineNo: [''],
      tollFreeNumber: [''],
      panNumber: [''],
      gstNumber: [''],
      address: [''],
      country: ['India'],
      state: [''],
      city: [''],
      branch: [''],
      mainBranch: [''],
      companyUUID: ['']
    });
  }
}
