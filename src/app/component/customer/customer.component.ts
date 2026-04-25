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
  showUpdateForm = false;
  isUpdating = false;
  updateMessage = '';
  updateError = '';
  updateCustomerForm = this.getEmptyUpdateForm();

  constructor(private customersService: CustomersService) { }

  ngOnInit(): void {
    this.loadCustomers();
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

  loadCustomers(): void {
    this.isLoading = true;
    this.loadError = '';

    this.customersService.getCustomers().subscribe({
      next: response => {
        const customerList = this.extractCustomers(response);

        if (customerList.length > 0) {
          this.customers = customerList.map(customer => this.toCustomerRow(customer));
        }

        this.isLoading = false;
      },
      error: error => {
        console.error('Customer API failed:', error);
        this.loadError = 'Unable to load latest customers. Showing saved customer data.';
        this.isLoading = false;
      }
    });
  }

  openCreateForm(): void {
    this.showCreateForm = true;
    this.showUpdateForm = false;
    this.createMessage = '';
    this.createError = '';
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
  }

  resetCreateForm(): void {
    this.newCustomer = this.getEmptyCustomerForm();
    this.createMessage = '';
    this.createError = '';
  }

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
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.dataList)) {
      return response.dataList;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return [];
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
            extraChargesList: [
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
