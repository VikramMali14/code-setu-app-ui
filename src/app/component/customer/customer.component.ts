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
  showCreateForm = false;
  isCreating = false;
  createMessage = '';
  createError = '';
  newCustomer = this.getEmptyCustomerForm();

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

  refreshStatus(customer: CustomerRow): void {
    customer.connectionStatus = customer.connectionStatus === 'Online' ? 'Offline' : 'Online';
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
}
