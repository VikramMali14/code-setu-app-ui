import { Component, OnInit } from '@angular/core';
import { CustomerModels } from 'src/app/models/customer-models';
import { CustomersService } from 'src/app/services/customers.service';

type ConnectionStatus = 'Online' | 'Offline';
type CustomerRow = CustomerModels & {
  username: string;
  serviceArea: string;
  accountNo: string;
  isp: string;
  connectionStatus: ConnectionStatus;
};

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customers: CustomerRow[] = [];

  searchText = '';
  selectedArea = 'Any';
  selectedStatus = 'All';
  startDate = '';
  endDate = '';
  isLoading = false;
  loadError = '';
  isDeleting = false;
  deleteMessage = '';
  deleteError = '';
  showCreateForm = false;
  isCreating = false;
  createMessage = '';
  createError = '';
  newCustomer = this.getEmptyCustomerForm();

  // Stepper
  createStep = 0;
  createSteps = ['Customer details', 'Shifting details', 'Charges', 'Review'];
  activeShiftIndex = 0;
  showUpdateForm = false;
  isUpdating = false;
  updateMessage = '';
  updateError = '';
  updateCustomerForm = this.getEmptyUpdateForm();
  pageSize = 5;
  pageRecords = 0;
  totalRecords = 0;
  currentPageNumber = 0;
  totalPages = 0;

  constructor(private customersService: CustomersService) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  get visiblePageNumbers(): number[] {
    const total = this.getDisplayTotalPages();
    const current = this.getDisplayCurrentPage();
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  get serviceAreas(): string[] {
    return Array.from(new Set(this.customers.map(customer => customer.serviceArea).filter(Boolean)));
  }

  get filteredCustomers(): CustomerRow[] {
    const search = this.searchText.trim().toLowerCase();
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;

    return this.customers.filter(customer => {
      const searchableText = [
        this.getCustomerName(customer),
        customer.username,
        customer.serviceArea,
        customer.accountNo,
        customer.isp,
        customer.mobileNo,
        customer.email,
        customer.shiftFromCity,
        customer.shiftToCity,
        customer.customerId
      ].join(' ').toLowerCase();
      const shiftingDate = customer.shiftingStartDate ? new Date(customer.shiftingStartDate) : null;

      const matchesSearch = !search || searchableText.includes(search);
      const matchesArea = this.selectedArea === 'Any' || customer.serviceArea === this.selectedArea;
      const matchesStatus = this.selectedStatus === 'All' || customer.connectionStatus === this.selectedStatus;
      const matchesStart = !start || (shiftingDate !== null && shiftingDate >= start);
      const matchesEnd = !end || (shiftingDate !== null && shiftingDate <= end);

      return matchesSearch && matchesArea && matchesStatus && matchesStart && matchesEnd;
    });
  }

  getCustomerName(customer: CustomerModels): string {
    return [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Customer';
  }

  getStatusClass(customer: CustomerRow): string {
    return customer.connectionStatus === 'Online' ? 'online' : 'offline';
  }

  loadCustomers(pageNumber = this.currentPageNumber): void {
  this.isLoading = true;
  this.loadError = '';
  this.customersService.getCustomers(pageNumber, this.pageSize).subscribe({
    next: response => {
      console.log('API RESPONSE:', response);

      const customerList = this.extractCustomers(response);

      this.updatePagination(response, customerList.length);
      this.customers = customerList.map(c => this.toCustomerRow(c));
      this.isLoading = false;
    },
    error: error => {
      console.error('Customer API failed:', error);
      this.loadError = 'Unable to load latest customers.';
      this.isLoading = false;
    }
  });
}

  goToPage(pageNumber: number): void {
    const total = this.getDisplayTotalPages();

    if (pageNumber < 0 || pageNumber >= total || pageNumber === this.currentPageNumber) {
      return;
    }

    this.currentPageNumber = pageNumber;
    this.loadCustomers(pageNumber);
  }

  changePageSize(): void {
    this.currentPageNumber = 0;
    this.loadCustomers(0);
  }

  openCreateForm(): void {
    this.showCreateForm = true;
    this.showUpdateForm = false;
    this.createMessage = '';
    this.createError = '';
    this.createStep = 0;
    this.activeShiftIndex = 0;
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
  }

  resetCreateForm(): void {
    this.newCustomer = this.getEmptyCustomerForm();
    this.createMessage = '';
    this.createError = '';
    this.createStep = 0;
    this.activeShiftIndex = 0;
  }
  // ── Stepper navigation ──────────────────────────────────────────────
  get isFirstCreateStep(): boolean { return this.createStep === 0; }
  get isLastCreateStep(): boolean  { return this.createStep === this.createSteps.length - 1; }

  nextCreateStep(): void {
    if (!this.validateCreateStep()) return;
    if (!this.isLastCreateStep) this.createStep++;
  }

  prevCreateStep(): void {
    if (!this.isFirstCreateStep) this.createStep--;
  }

  goToCreateStep(index: number): void {
    if (index < this.createStep) this.createStep = index;
  }

  validateCreateStep(): boolean {
    if (this.createStep === 0) {
      if (!this.newCustomer.firstName?.trim()) { this.showCreateSnackbar('First name is required', true); return false; }
      if (!this.newCustomer.lastName?.trim())  { this.showCreateSnackbar('Last name is required', true); return false; }
      if (!this.newCustomer.mobileNo?.trim())  { this.showCreateSnackbar('Mobile number is required', true); return false; }
      if (!this.newCustomer.email?.trim())     { this.showCreateSnackbar('Email is required', true); return false; }
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(this.newCustomer.email)) { this.showCreateSnackbar('Enter a valid email address', true); return false; }
    }
    if (this.createStep === 1) {
      for (let i = 0; i < this.newCustomer.shiftings.length; i++) {
        const s = this.newCustomer.shiftings[i];
        if (!s.shiftFromCity?.trim() || !s.shiftToCity?.trim()) {
          this.showCreateSnackbar(`From and To city are required for Shifting ${i + 1}`, true);
          this.activeShiftIndex = i;
          return false;
        }
      }
    }
    return true;
  }

  // ── Snackbar ────────────────────────────────────────────────────────
  createSnackbar = { message: '', error: false, visible: false };
  private snackbarTimer: any;

  showCreateSnackbar(message: string, error = false): void {
    clearTimeout(this.snackbarTimer);
    this.createSnackbar = { message, error, visible: true };
    this.snackbarTimer = setTimeout(() => this.createSnackbar.visible = false, 3500);
  }

  // ── Shifting helpers ────────────────────────────────────────────────
  getShiftLabel(s: any, i: number): string {
    return s.shiftFromCity && s.shiftToCity ? `${s.shiftFromCity} → ${s.shiftToCity}` : `Shifting ${i + 1}`;
  }

  addShifting(): void {
    this.newCustomer.shiftings.push({
      isShiftCompleted: false,
      shiftFromCity: '',
      shiftToCity: '',
      fromAddress: '',
      toAddress: '',
      shiftingType: '',
      shiftingStartDate: '',
      shiftReachedDate: '',
      shiftCompletedBy: '',
      shiftCompletedById: null,
      customerId: null,
      chargesDTO: {
        transportCharge: 0,
        packingCharge: 0,
        loadingCharge: 0,
        unloadingCharge: 0,
        unpackingCharge: 0,
        carTransportCharge: 0,
        riskInsureCharge: 0,
        storageCharge: 0,
        statisticalCharge: 0,
        serviceCharge: 0,
        serviceRate: 0,
        gstRate: 18,
        gstCharge: 0,
        extraChargesList: []
      }
    });
    this.activeShiftIndex = this.newCustomer.shiftings.length - 1;
  }

  removeShifting(index: number): void {
    if (this.newCustomer.shiftings.length <= 1) {
      this.showCreateSnackbar('At least one shifting is required', true);
      return;
    }
    this.newCustomer.shiftings.splice(index, 1);
    this.activeShiftIndex = Math.max(0, this.activeShiftIndex - 1);
  }

  addExtraCharge(shiftIndex: number): void {
    this.newCustomer.shiftings[shiftIndex].chargesDTO.extraChargesList.push({
      chargeName: '', chargeValue: 0, chargeRate: 0
    });
  }

  removeExtraCharge(shiftIndex: number, chargeIndex: number): void {
    this.newCustomer.shiftings[shiftIndex].chargesDTO.extraChargesList.splice(chargeIndex, 1);
  }

  trackByIndex(index: number): number { return index; }


  createCustomer(): void {
    this.isCreating = true;
    this.createMessage = '';
    this.createError = '';

    this.customersService.createCustomer(this.newCustomer).subscribe({
      next: () => {
        this.isCreating = false;
        this.createMessage = 'Customer created successfully.';
        this.resetCreateForm();
        this.showCreateForm = false;
        this.createStep = 0;
        this.activeShiftIndex = 0;
        this.loadCustomers();
      },
      error: error => {
        console.error('Create customer failed:', error);
        this.isCreating = false;
        this.createError = error.error?.responseMessege || error.error?.message || 'Unable to create customer.';
      }
    });
  }

  openUpdateForm(customer: CustomerRow): void {
    this.showCreateForm = false;
    this.showUpdateForm = true;
    this.updateMessage = '';
    this.updateError = '';
    this.updateCustomerForm = {
      customerId: customer.customerId,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      mobileNo: customer.mobileNo || '',
      alternateMobileNo: customer.alternateMobileNo || '',
      email: customer.email || '',
      workEmail: customer.workEmail || '',
      uuid: customer.uuid || ''
    };
  }

  closeUpdateForm(): void {
    this.showUpdateForm = false;
  }

  resetUpdateForm(): void {
    this.updateCustomerForm = this.getEmptyUpdateForm();
    this.updateMessage = '';
    this.updateError = '';
  }

  updateCustomer(): void {
    this.isUpdating = true;
    this.updateMessage = '';
    this.updateError = '';

    this.customersService.updateCustomer(this.updateCustomerForm).subscribe({
      next: () => {
        this.isUpdating = false;
        this.updateMessage = 'Customer updated successfully.';
        this.showUpdateForm = false;
        this.loadCustomers();
      },
      error: error => {
        console.error('Update customer failed:', error);
        this.isUpdating = false;
        this.updateError = error.error?.responseMessege || error.error?.message || 'Unable to update customer.';
      }
    });
  }

private extractCustomers(response: any): any[] {
  if (!response) return [];

  // ✅ YOUR REAL CASE (Spring Page)
  if (Array.isArray(response?.data?.content)) {
    return response.data.content;
  }

  // fallback cases
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.dataList)) return response.dataList;
  if (Array.isArray(response?.data)) return response.data;

  console.warn('Unknown response format:', response);
  return [];
}

private updatePagination(response: any, loadedRecords: number): void {
  const pageData = response?.data;

  this.pageRecords = pageData?.numberOfElements ?? loadedRecords;
  this.totalRecords = pageData?.totalElements ?? loadedRecords;
  this.currentPageNumber = pageData?.number ?? 0;
  this.totalPages = pageData?.totalPages ?? 1;
}

  getDisplayCurrentPage(): number {
    return this.currentPageNumber + 1;
  }

  getDisplayTotalPages(): number {
    return this.totalPages || (this.filteredCustomers.length > 0 ? 1 : 0);
  }

  getDisplayTotalRecords(): number {
    return this.totalRecords || this.filteredCustomers.length;
  }

  private toCustomerRow(customer: any): CustomerRow {
    const firstName = customer.firstName || customer.name || customer.customerName || 'Customer';
    const lastName = customer.lastName || '';
    const username = customer.username || customer.userName || customer.accountNo || customer.accountNumber || '';
    const serviceArea = customer.serviceArea || customer.shiftFromCity || 'ACT';
    const accountNo = customer.accountNo || customer.accountNumber || username || String(customer.customerId || '');
    const rawStatus = customer.status || customer.connectionStatus || (customer.shiftCompleted ? 'Online' : 'Offline');
    const connectionStatus: ConnectionStatus = String(rawStatus).toLowerCase() === 'online' ? 'Online' : 'Offline';

    return {
      ...customer,
      firstName,
      lastName,
      username,
      serviceArea,
      accountNo,
      isp: customer.isp || customer.ispName || 'admin',
      connectionStatus,
      mobileNo: customer.mobileNo || customer.mobile || customer.mobileNumber || ''
    };
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedArea = 'Any';
    this.selectedStatus = 'All';
    this.startDate = '';
    this.endDate = '';
  }

  exportCustomers(): void {
    const rows = this.filteredCustomers.map(customer => [
      customer.customerId || '',
      this.getCustomerName(customer),
      customer.username,
      customer.mobileNo || '',
      customer.accountNo,
      customer.serviceArea,
      customer.connectionStatus,
      customer.isp
    ]);
    const csv = [
      ['Customer ID', 'Name', 'Username', 'Mobile', 'Account No', 'Service Area', 'Connection Status', 'ISP Name'],
      ...rows
    ].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = 'customers.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  deleteCustomer(customer: CustomerRow): void {
    const payload = {
      customerId: customer.customerId || 0,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      mobileNo: customer.mobileNo || '',
      alternateMobileNo: customer.alternateMobileNo || '',
      email: customer.email || '',
      workEmail: customer.workEmail || '',
      uuid: customer.uuid || ''
    };

    this.isDeleting = true;
    this.deleteMessage = '';
    this.deleteError = '';

    this.customersService.deleteCustomer(payload).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deleteMessage = 'Customer deleted successfully.';
        this.loadCustomers();
      },
      error: error => {
        console.error('Delete customer failed:', error);
        this.isDeleting = false;
        this.deleteError = error.error?.responseMessege || error.error?.message || 'Unable to delete customer.';
      }
    });
  }

  private getEmptyCustomerForm(): any {
    return {
      firstName: '',
      lastName: '',
      mobileNo: '',
      alternateMobileNo: '',
      email: '',
      workEmail: '',
      shiftings: [
        {
          isShiftCompleted: false,
          shiftFromCity: '',
          shiftToCity: '',
          fromAddress: '',
          toAddress: '',
          shiftingType: '',
          shiftingStartDate: new Date().toISOString().slice(0, 10),
          shiftReachedDate: '',
          shiftCompletedBy: '',
          shiftCompletedById: null,
          customerId: null,
          charges: {
            transportCharge: 0,
            packingCharge: 0,
            loadingCharge: 0,
            unloadingCharge: 0,
            unpackingCharge: 0,
            carTransportCharge: 0,
            riskInsureCharge: 0,
            storageCharge: 0,
            statisticalCharge: 0,
            serviceCharge: 0,
            serviceRate: 0,
            gstRate: 18,
            gstCharge: 0,
            extracharges: [
              { chargeName: 'Toll Charge', chargeValue: 0, chargeRate: 0 },
              { chargeName: 'Lift Handling Charge', chargeValue: 0, chargeRate: 0 }
            ]
          }
        }
      ]
    };
  }

  private getEmptyUpdateForm(): any {
    return {
      customerId: null,
      firstName: '',
      lastName: '',
      mobileNo: '',
      alternateMobileNo: '',
      email: '',
      workEmail: '',
      uuid: ''
    };
  }
}