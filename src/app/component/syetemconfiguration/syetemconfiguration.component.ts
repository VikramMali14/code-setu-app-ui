import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShowpopupService } from 'src/app/services/showpopup.service';
import { SystemConfigurationService } from 'src/app/services/system-configuration.service';

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
    private showpopup: ShowpopupService
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
      isActive: [true, Validators.required]
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
      isActive: true
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
      isActive: configuration.isActive ?? true
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.editingId = null;
    this.configurationForm.reset({
      isActive: true
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

    if (!id || !confirm('Delete this system configuration?')) {
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
        item.isActive ? 'active' : 'inactive'
      ].join(' ').toLowerCase().includes(search)
    );
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

  private showResponse(response: any, fallbackMessage: string): void {
    if (response?.responseMessege || response?.responseCode) {
      this.showpopup.showResponsePopup(response.responseMessege || fallbackMessage, response.responseCode || 200);
      return;
    }

    this.showpopup.showSuccess(fallbackMessage);
  }

}
