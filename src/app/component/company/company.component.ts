import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CompanyService } from 'src/app/services/company.service';
import { ShowpopupService } from 'src/app/services/showpopup.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})

export class CompanyComponent implements OnInit {
  @ViewChild('confirmDialog') confirmDialogTemplate!: TemplateRef<any>;
  @ViewChild('sameAs1') sameAs1Checkbox!: import('@angular/core').ElementRef<HTMLInputElement>;
  @ViewChild('sameAs2') sameAs2Checkbox!: import('@angular/core').ElementRef<HTMLInputElement>;

  companyList: any[] = [];
  assetTypes: string[] = ['LOGO', 'SEAL/Signature', 'STAMP'];
  companyForm!: FormGroup;

  showForm = false;
  isEditMode = false;
  isLoading = false;
  selectedAssetFile: File | null = null;
  selectedAssetFileName = '';
  addedAssets: { assetType: string; file: File; fileName: string }[] = [];

  countryCodes: any[] = [
    { name: 'India', code: '+91', cca2: 'IN' },
    { name: 'USA', code: '+1', cca2: 'US' },
    { name: 'UK', code: '+44', cca2: 'GB' },
    { name: 'UAE', code: '+971', cca2: 'AE' }
  ];

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private shoepopup: ShowpopupService,
    private dialog: MatDialog,
    private http: HttpClient,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.loadCountryCodes();
    this.buildForm();
    this.loadCompanies();
  }

  buildForm() {
    const codePattern = '^\\+?\\d{1,4}$';
    const numberPattern = '^[0-9]{7,15}$';
    const panPattern = '^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$';
    const gstPattern = '^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ][0-9a-zA-Z]{1}$';

    this.companyForm = this.fb.group({
      companyId: [null],
      companyName: ['', Validators.required],
      companyEmail: ['', [Validators.required, Validators.email]],
      whatsappCode: ['+91', [Validators.pattern(codePattern)]],
      whatsappNumber: ['', [Validators.pattern(numberPattern)]],
      contactNo1Code: ['+91', [Validators.required, Validators.pattern(codePattern)]],
      contactNo1Number: ['', [Validators.required, Validators.pattern(numberPattern)]],
      contactNo2Code: ['+91', [Validators.pattern(codePattern)]],
      contactNo2Number: ['', [Validators.pattern(numberPattern)]],
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

    this.companyForm.get('whatsappNumber')?.valueChanges.subscribe(() => {
      if (this.sameAs1Checkbox?.nativeElement) this.sameAs1Checkbox.nativeElement.checked = false;
      if (this.sameAs2Checkbox?.nativeElement) this.sameAs2Checkbox.nativeElement.checked = false;
    });

    this.companyForm.get('whatsappCode')?.valueChanges.subscribe(() => {
      if (this.sameAs1Checkbox?.nativeElement) this.sameAs1Checkbox.nativeElement.checked = false;
      if (this.sameAs2Checkbox?.nativeElement) this.sameAs2Checkbox.nativeElement.checked = false;
    });

    // Monitor and log invalid controls for easier troubleshooting
    this.companyForm.statusChanges.subscribe(status => {
      if (status === 'INVALID') {
        const errorsList: string[] = [];
        const controls = this.companyForm.controls;
        for (const name in controls) {
          if (controls[name].invalid) {
            errorsList.push(`${name}: invalid (errors: ${JSON.stringify(controls[name].errors)}, value: "${controls[name].value}")`);
          }
        }
        console.warn('❌ Company form is INVALID. Reasons:\n' + errorsList.join('\n'));
      }
    });
  }

  loadCompanies() {
    this.isLoading = true;
    this.companyService.getCurrentCompany().subscribe({
      next: (res: any) => {
        let data = res.dataList || res.data;
        this.companyList = Array.isArray(data) ? data : (data ? [data] : []);
        if (this.companyList.length > 0) {
          this.companyList = this.companyList.slice(0, 1);
          this.companyService.setCompanyStatus(true);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  openCreateForm() {
    this.showForm = true;
    this.isEditMode = false;
    this.companyForm.reset();
    this.companyForm.patchValue({
      country: 'India',
      whatsappCode: '+91',
      contactNo1Code: '+91',
      contactNo2Code: '+91',
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
    if (this.sameAs1Checkbox?.nativeElement) this.sameAs1Checkbox.nativeElement.checked = false;
    if (this.sameAs2Checkbox?.nativeElement) this.sameAs2Checkbox.nativeElement.checked = false;
  }

  submitForm() {

    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {

      const payload = this.buildCompanyFormData();
      this.companyService.updateCompany(payload).subscribe({
        next: (response: any) => {
          this.shoepopup.showResponsePopup(response.responseMessege, response.responseCode)

          this.companyService.setCompanyStatus(true);
          this.applyCompanyResponse(response);
          this.refreshSessionAfterCompanyChange();

          this.cancelForm();
        },
        error: err => console.error(err)
      });

    } else {

      const payload = this.buildCompanyFormData();
      this.companyService.createCompany(payload).subscribe({
        next: (response: any) => {
          this.shoepopup.showResponsePopup(response.responseMessege, response.responseCode)

          this.companyService.setCompanyStatus(true);
          this.applyCompanyResponse(response);
          this.refreshSessionAfterCompanyChange();

          this.cancelForm();
        },
        error: err => console.error(err)
      });

    }
  }

  // Show the company profile immediately from the create/update response data.
  private applyCompanyResponse(response: any): void {
    const data = response?.data || response?.dataList?.[0];
    if (data && typeof data === 'object') {
      this.companyList = [data];
    }
  }

  // Refresh the JWT and rebuild the session (token, user_session, user) so the
  // newly created/updated company is bound to the current logged-in session.
  private refreshSessionAfterCompanyChange(): void {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;

    this.loginService.refreshSession().subscribe({
      next: (userDetails: any) => {
        console.log('Session refreshed successfully after company change', userDetails);
        // Re-pull the current company so the profile reflects the fresh token/data.
        this.loadCurrentCompany();
      },
      error: (err) => console.error('Session refresh failed:', err)
    });
  }

  private loadCurrentCompany(): void {
    this.companyService.getCurrentCompany().subscribe({
      next: (res: any) => {
        if (res && res.responseCode === 200 && res.data) {
          this.companyList = [res.data];
          this.companyService.setCompanyStatus(true);
        }
      },
      error: (err) => console.warn('getCurrentCompany failed:', err)
    });
  }

  getCompanyLogoUrl(company: any): string | null {
    if (company?.assets && Array.isArray(company.assets)) {
      const logoAsset = company.assets.find((a: any) => a.assetType === 'LOGO');
      if (logoAsset && logoAsset.fileUrl) {
        return logoAsset.fileUrl;
      }
    }
    return company?.logoBase64 || null;
  }

  editCompany(company: any) {
    console.log("Editing company:", company);
    if (!company || !this.companyForm) {
      console.warn("Company object or companyForm is not defined.");
      return;
    }
    try {
      this.showForm = true;
      this.isEditMode = true;

      const parsedWhatsapp = this.parsePhoneNumber(company.whatsappNumber);
      const parsedContact1 = this.parsePhoneNumber(company.contactNo1);
      const parsedContact2 = this.parsePhoneNumber(company.contactNo2);

      this.companyForm.patchValue({
        ...company,
        whatsappCode: parsedWhatsapp.code,
        whatsappNumber: parsedWhatsapp.number,
        contactNo1Code: parsedContact1.code,
        contactNo1Number: parsedContact1.number,
        contactNo2Code: parsedContact2.code,
        contactNo2Number: parsedContact2.number,
        assetType: ''
      });
      this.clearAssetFile();
      this.addedAssets = [];
    } catch (e) {
      console.error("Error patching company form:", e);
    }
  }
  confirmWebsiteRedirect(url: string) {
    if (!url) return;
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    const wantToRedirect = window.confirm(`Do you want to visit ${finalUrl}? This will open in a new tab.`);
    if (wantToRedirect) {
      window.open(finalUrl, '_blank');
    }
  }

  copyWhatsAppTo(targetField: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      const whatsappCode = this.companyForm.get('whatsappCode')?.value;
      const whatsappNumber = this.companyForm.get('whatsappNumber')?.value;
      
      this.companyForm.patchValue({
        [`${targetField}Code`]: whatsappCode,
        [`${targetField}Number`]: whatsappNumber
      });
    }
  }

  toUpperCase(controlName: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const upperValue = input.value.toUpperCase();
    this.companyForm.get(controlName)?.setValue(upperValue, { emitEvent: false });
    input.value = upperValue;
  }

  onAssetFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    this.selectedAssetFile = file;
    this.selectedAssetFileName = file?.name || '';
    this.companyForm.patchValue({ assetFile: file });
    this.companyForm.get('assetFile')?.updateValueAndValidity();
    
    this.checkAndAutoAddAsset();
  }

  clearAssetFile(): void {
    this.selectedAssetFile = null;
    this.selectedAssetFileName = '';
    this.companyForm?.patchValue({ assetFile: null });
    this.companyForm?.get('assetFile')?.updateValueAndValidity();
  }

  private getCompanyPayload(): any {
    const { assetFile, whatsappCode, whatsappNumber, contactNo1Code, contactNo1Number, contactNo2Code, contactNo2Number, ...payload } = this.companyForm.value;
    payload.whatsappNumber = whatsappNumber ? (whatsappCode || '') + whatsappNumber : '';
    payload.contactNo1 = contactNo1Number ? (contactNo1Code || '') + contactNo1Number : '';
    payload.contactNo2 = contactNo2Number ? (contactNo2Code || '') + contactNo2Number : '';
    return payload;
  }

  checkAndAutoAddAsset(): void {
    const type = this.companyForm.get('assetType')?.value;
    if (type && this.selectedAssetFile) {
      if (this.addedAssets.some(x => x.assetType === type)) {
        this.shoepopup.showResponsePopup(`An asset of type ${type} has already been added.`, 400);
        this.companyForm.patchValue({ assetType: '' });
        this.clearAssetFile();
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

  private buildCompanyFormData(): FormData {
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

  get hasCompany(): boolean {
    return this.companyList.length > 0;
  }

  get currentCompany(): any {
    return this.companyList[0] || null;
  }

  joinAddressParts(parts: any[]): string {
    return parts.filter(Boolean).join(', ');
  }

  deleteCompany(id: number) {
    // Open the inline template as a dialog
    const dialogRef = this.dialog.open(this.confirmDialogTemplate, {
      width: '380px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.companyService.deleteCompany(id).subscribe({
          next: (response: any) => {
            this.shoepopup.showResponsePopup(response.responseMessege, response.responseCode);
            this.companyList = [];
            this.companyService.setCompanyStatus(false);
            this.refreshSessionAfterCompanyChange();
          },
          error: err => console.error(err)
        });
      }
    });
  }

  loadCountryCodes() {
    this.http.get<any[]>('https://restcountries.com/v3.1/all?fields=name,idd,cca2').subscribe({
      next: (countries) => {
        if (Array.isArray(countries)) {
          this.countryCodes = countries
            .map(c => {
              const root = c.idd?.root || '';
              const suffix = c.idd?.suffixes?.[0] || '';
              return {
                name: c.name?.common || '',
                code: root + suffix,
                cca2: c.cca2 || ''
              };
            })
            .filter(c => c.name && c.code)
            .sort((a, b) => a.name.localeCompare(b.name));
        }
      },
      error: (err) => {
        console.error('Failed to load country codes', err);
      }
    });
  }

  parsePhoneNumber(fullNo: any): { code: string, number: string } {
    if (fullNo === null || fullNo === undefined) return { code: '+91', number: '' };
    let str = fullNo.toString().replace(/[^\d+]/g, '').trim();
    if (!str) return { code: '+91', number: '' };

    let code = '+91';
    if (!str.startsWith('+')) {
      const match = this.countryCodes.find(c => {
        if (!c.code) return false;
        const cleanCode = c.code.replace('+', '');
        return str.startsWith(cleanCode) && str.length > 10;
      });
      if (match) {
        code = match.code;
        const cleanCode = match.code.replace('+', '');
        str = str.substring(cleanCode.length);
      }
    } else {
      const match = this.countryCodes.find(c => c.code && str.startsWith(c.code));
      if (match) {
        code = match.code;
        str = str.substring(match.code.length);
      }
    }

    // Recursively strip duplicate country code digits from the front if str length is greater than 10
    const codeDigits = code.replace('+', '');
    while (str.startsWith(codeDigits) && str.length > 10) {
      str = str.substring(codeDigits.length);
    }

    return { code: code, number: str };
  }
}


