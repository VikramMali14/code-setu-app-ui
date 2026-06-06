import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShowpopupService } from 'src/app/services/showpopup.service';
import { SystemConfigurationService } from 'src/app/services/system-configuration.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogboxComponent } from '../dialogbox/dialogbox.component';

@Component({
  selector: 'app-syetemconfiguration',
  templateUrl: './syetemconfiguration.component.html',
  styleUrls: ['./syetemconfiguration.component.css']
})
export class SyetemconfigurationComponent implements OnInit {
  configurationForm!: FormGroup;
  configurationList: any[] = [];
  searchText = '';
  showForm = false;
  isEditMode = false;
  isLoading = false;
  editingId: number | null = null;

  currentPageNumber = 0;
  pageSize = 5;

  constructor(
    private fb: FormBuilder,
    private systemConfigurationService: SystemConfigurationService,
    private showpopup: ShowpopupService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.loadConfigurations();
  }

  buildForm(): void {
    this.configurationForm = this.fb.group({
      value: ['', Validators.required],
      module: ['', Validators.required],
      name: ['', Validators.required],
      isActive: ['ACTIVE', Validators.required],
      isDeleted: [false, Validators.required]
    });
  }

  loadConfigurations(): void {
    this.isLoading = true;

    this.systemConfigurationService.getConfigurations().subscribe({
      next: (response: any) => {
        this.configurationList = this.extractList(response);
        this.syncCurrentPage();
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.showpopup.showError('Unable to load system configurations');
        this.isLoading = false;
      }
    });
  }

  openCreateForm(): void {
    this.showForm = true;
    this.isEditMode = false;
    this.editingId = null;
    this.configurationForm.reset({
      isActive: 'ACTIVE',
      isDeleted: false
    });
  }

  editConfiguration(configuration: any): void {
    this.showForm = true;
    this.isEditMode = true;
    this.editingId = this.getConfigurationId(configuration);
    this.configurationForm.patchValue({
      value: configuration.value,
      module: configuration.module,
      name: configuration.name,
      isActive: this.normalizeStatus(configuration.isActive),
      isDeleted: configuration.isDeleted ?? false
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.editingId = null;
    this.configurationForm.reset({
      isActive: 'ACTIVE',
      isDeleted: false
    });
  }

  submitForm(): void {
    if (this.configurationForm.invalid) {
      this.configurationForm.markAllAsTouched();
      return;
    }

    const payload = this.configurationForm.value;

    if (this.isEditMode && this.editingId !== null) {
      this.systemConfigurationService.updateConfiguration(this.editingId, payload).subscribe({
        next: (response: any) => {
          this.showResponse(response, 'System configuration updated successfully');
          this.loadConfigurations();
          this.cancelForm();
        },
        error: (error) => {
          console.error(error);
          this.showpopup.showError('Unable to update system configuration');
        }
      });
      return;
    }

    this.systemConfigurationService.createConfiguration(payload).subscribe({
      next: (response: any) => {
        this.showResponse(response, 'System configuration created successfully');
        this.loadConfigurations();
        this.cancelForm();
      },
      error: (error) => {
        console.error(error);
        this.showpopup.showError('Unable to create system configuration');
      }
    });
  }

  deleteConfiguration(configuration: any): void {
    const id = this.getConfigurationId(configuration);
    if (!id) {
      return;
    }

    const dialogRef = this.dialog.open(DialogboxComponent, {
      width: '420px',
      disableClose: true,
      data: {
        title: 'Delete Configuration',
        message: 'Are you sure you want to delete this configuration?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      this.systemConfigurationService.deleteConfiguration(id).subscribe({
        next: (response: any) => {
          this.showResponse(response, 'System configuration deleted successfully');
          this.loadConfigurations();
        },
        error: (error) => {
          console.error(error);
          this.showpopup.showError('Unable to delete system configuration');
        }
      });
    });
  }

  get filteredConfigurations(): any[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.configurationList;
    }

    return this.configurationList.filter((item) =>
      [
        item.name,
        item.module,
        item.value,
        this.getStatusLabel(item.isActive)
      ].join(' ').toLowerCase().includes(search)
    );
  }

  getStatusLabel(status: any): string {
    return this.normalizeStatus(status);
  }

  getStatusClass(status: any): string {
    const normalizedStatus = this.normalizeStatus(status).toLowerCase();
    return normalizedStatus === 'suspend' ? 'suspend' : normalizedStatus;
  }

  get totalRecords(): number {
    return this.filteredConfigurations.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get paginatedConfigurations(): any[] {
    const start = this.currentPageNumber * this.pageSize;
    return this.filteredConfigurations.slice(start, start + this.pageSize);
  }

  get pageRecords(): number {
    return this.paginatedConfigurations.length;
  }

  onSearchChange(): void {
    this.currentPageNumber = 0;
  }

  goToPage(pageNumber: number): void {
    this.currentPageNumber = pageNumber;
    this.syncCurrentPage();
  }

  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPageNumber = 0;
  }

  getConfigurationId(configuration: any): number {
    return configuration?.id || configuration?.configurationId || configuration?.systemConfigurationId;
  }

  private syncCurrentPage(): void {
    const lastPage = Math.max(this.totalPages - 1, 0);
    if (this.currentPageNumber > lastPage) {
      this.currentPageNumber = lastPage;
    }
  }

  private extractList(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    return response?.dataList || response?.data || response?.content || [];
  }

  private normalizeStatus(status: any): string {
    if (status === true) {
      return 'ACTIVE';
    }

    if (status === false || status === null || status === undefined || status === '') {
      return 'INACTIVE';
    }

    const normalizedStatus = String(status).trim().toUpperCase();
    return normalizedStatus === 'SUSPEND' ? 'SUSPEND' : normalizedStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
  }

  private showResponse(response: any, fallbackMessage: string): void {
    if (response?.responseMessege || response?.responseCode) {
      this.showpopup.showResponsePopup(response.responseMessege || fallbackMessage, response.responseCode || 200);
      return;
    }

    this.showpopup.showSuccess(fallbackMessage);
  }

}
