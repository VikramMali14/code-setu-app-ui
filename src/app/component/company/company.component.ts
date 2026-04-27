// company.component.ts

import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CompanyService } from 'src/app/services/company.service';
import { ShowpopupService } from 'src/app/services/showpopup.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})

export class CompanyComponent implements OnInit {
  @ViewChild('confirmDialog') confirmDialogTemplate!: TemplateRef<any>;

  companyList: any[] = [];
  companyForm!: FormGroup;

  showForm = false;
  isEditMode = false;
  searchText = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private shoepopup: ShowpopupService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.loadCompanies();
  }

  buildForm() {
    const mobilePattern = '^[6-9]\\d{9}$';
    const panPattern = '^[A-Z]{5}[0-9]{4}[A-Z]{1}$';
    // GST: 2 digits, 10 PAN chars, 1 entity digit, 'Z', 1 checksum char
    const gstPattern = '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$';

    this.companyForm = this.fb.group({
      companyName: ['', Validators.required],
      companyEmail: ['', [Validators.required, Validators.email]],
      whatsappNumber: ['', [Validators.pattern(mobilePattern)]],
      contactNo1: ['', [Validators.required, Validators.pattern(mobilePattern)]],
      contactNo2: ['', [Validators.pattern(mobilePattern)]],
      landlineNo: [''],
      tollFreeNumber: [''],
      panNumber: ['', [Validators.pattern(panPattern)]],
      gstNumber: ['', [Validators.pattern(gstPattern)]],
      address: [''],
      country: ['India'],
      state: [''],
      city: [''],
      branch: [''],
      mainBranch: [''],
      isActive: [true]
    });
  }

  loadCompanies() {
    this.companyService.getCompany().subscribe({
      next: (res: any) => {
        this.companyList = res.dataList || res.data || [];
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  openCreateForm() {
    this.showForm = true;
    this.isEditMode = false;
    this.companyForm.reset();
    this.companyForm.patchValue({
      country: 'India',
      isActive: true
    });
  }

  cancelForm() {
    this.showForm = false;
    this.companyForm.reset();
  }

  submitForm() {

    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    const payload = this.companyForm.value;

    if (this.isEditMode) {

      this.companyService.updateCompany(payload).subscribe({
        next: (response: any) => {
          this.shoepopup.showResponsePopup(response.responseMessege, response.responseCode)

          this.loadCompanies();
          this.cancelForm();
        },
        error: err => console.error(err)
      });

    } else {

      this.companyService.createCompany(payload).subscribe({
        next: (response: any) => {
          this.shoepopup.showResponsePopup(response.responseMessege, response.responseCode)
          this.loadCompanies();
          this.cancelForm();
        },
        error: err => console.error(err)
      });

    }
  }

  editCompany(company: any) {
    this.showForm = true;
    this.isEditMode = true;
    this.companyForm.patchValue(company);
  }

  // deleteCompany(id: number) {

  //   if (!confirm('Delete this company?')) return;

  //   this.companyService.deleteCompany(id).subscribe({
  //     next: (response:any) => {
  //       this.shoepopup.showResponsePopup(response.responseMessege, response.responseCode);
  //       this.loadCompanies();
  //     },
  //     error: err => console.error(err)
  //   });
  // }

  filteredCompanies() {

    if (!this.searchText) return this.companyList;

    return this.companyList.filter(x =>
      x.companyName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      x.companyEmail?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      x.city?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  focusSearch(): void {
    setTimeout(() => {
      const searchInput = document.querySelector('.search-box input') as HTMLInputElement;
      searchInput?.focus();
    }, 100);
  }

  deleteCompany(id: number) {
    // Open the inline template as a dialog
    const dialogRef = this.dialog.open(this.confirmDialogTemplate, {
      width: '350px'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.companyService.deleteCompany(id).subscribe({
          next: (response: any) => {
            this.shoepopup.showResponsePopup(response.responseMessege, response.responseCode);
            this.loadCompanies();
          },
          error: err => console.error(err)
        });
      }
    });
  }

}