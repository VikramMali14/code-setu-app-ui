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
  assetTypes: string[] = ['LOGO', 'SEAL', 'Signature', 'STAMP'];
  companyForm!: FormGroup;

  showForm = false;
  isEditMode = false;
  searchText = '';
  isLoading = false;
  selectedAssetFile: File | null = null;
  selectedAssetFileName = '';
  currentPageNumber = 0;
  pageSize = 5;
  addedAssets: { assetType: string; file: File; fileName: string }[] = [];

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
      website: [''],
      isActive: [true],
      assetType: [''],
      assetFile: [null]
    });
  }

  loadCompanies() {
    this.companyService.getCompany().subscribe({
      next: (res: any) => {
        this.companyList = res.dataList || res.data || [];
        this.syncCurrentPage();
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
    this.clearAssetFile();
    this.addedAssets = [];
  }

  cancelForm() {
    this.showForm = false;
    this.companyForm.reset();
    this.clearAssetFile();
    this.addedAssets = [];
  }

  submitForm() {

    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {

      const payload = this.getCompanyPayload();
      this.companyService.updateCompany(payload).subscribe({
        next: (response: any) => {
          this.shoepopup.showResponsePopup(response.responseMessege, response.responseCode)

          this.loadCompanies();
          this.cancelForm();
        },
        error: err => console.error(err)
      });

    } else {

      const payload = this.buildCreateCompanyFormData();
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
    this.clearAssetFile();
    this.addedAssets = [];
  }

  onAssetFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    this.selectedAssetFile = file;
    this.selectedAssetFileName = file?.name || '';
    this.companyForm.patchValue({ assetFile: file });
    this.companyForm.get('assetFile')?.updateValueAndValidity();
  }

  clearAssetFile(): void {
    this.selectedAssetFile = null;
    this.selectedAssetFileName = '';
    this.companyForm?.patchValue({ assetFile: null });
    this.companyForm?.get('assetFile')?.updateValueAndValidity();
  }

  private getCompanyPayload(): any {
    const { assetFile, ...payload } = this.companyForm.value;
    return payload;
  }

  addAssetToList(): void {
    const type = this.companyForm.get('assetType')?.value;
    if (type && this.selectedAssetFile) {
      if (this.addedAssets.some(x => x.assetType === type)) {
        this.shoepopup.showResponsePopup(`An asset of type ${type} has already been added.`, 400);
        return;
      }
      this.addedAssets.push({
        assetType: type,
        file: this.selectedAssetFile,
        fileName: this.selectedAssetFileName
      });
      this.companyForm.patchValue({ assetType: '' });
      this.clearAssetFile();
    }
  }

  removeAssetFromList(index: number): void {
    this.addedAssets.splice(index, 1);
  }

  private buildCreateCompanyFormData(): FormData {
    const formData = new FormData();
    const payload = this.getCompanyPayload();

    Object.keys(payload).forEach((key) => {
      if (key === 'assetType') {
        return;
      }

      const value = payload[key];
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });

    this.addedAssets.forEach((asset, index) => {
      formData.append(`assets[${index}].assetType`, asset.assetType);
      formData.append(`assets[${index}].file`, asset.file, asset.fileName);
    });

    return formData;
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

  get filteredCompanyList() {

    if (!this.searchText) return this.companyList;

    return this.companyList.filter(x =>
      x.companyName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      x.companyEmail?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      x.city?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  filteredCompanies() {
    return this.filteredCompanyList;
  }

  get totalRecords(): number {
    return this.filteredCompanyList.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get paginatedCompanies() {
    const start = this.currentPageNumber * this.pageSize;
    return this.filteredCompanyList.slice(start, start + this.pageSize);
  }

  get pageRecords(): number {
    return this.paginatedCompanies.length;
  }

  goToPage(pageNumber: number): void {
    this.currentPageNumber = pageNumber;
    this.syncCurrentPage();
  }

  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPageNumber = 0;
  }

  onSearchChange(): void {
    this.currentPageNumber = 0;
  }

  private syncCurrentPage(): void {
    const lastPage = Math.max(this.totalPages - 1, 0);
    if (this.currentPageNumber > lastPage) {
      this.currentPageNumber = lastPage;
    }
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
