import { Component, OnInit } from '@angular/core';
import { CustomerModels } from 'src/app/models/customer-models';

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
  customers: CustomerRow[] = [
    {
      customerId: 1001,
      firstName: 'Mr Customer_59',
      lastName: 'Customer_59',
      username: 'Customer_59',
      serviceArea: 'ACT',
      accountNo: 'Customer_59',
      isp: 'admin',
      connectionStatus: 'Offline',
      mobileNo: '9876543210',
      email: 'customer59@example.com',
      shiftFromCity: 'Pune',
      shiftToCity: 'Bangalore',
      shiftingStartDate: '2026-04-28',
      shiftReachedDate: '2026-05-01',
      shiftCompleted: false
    },
    {
      customerId: 1002,
      firstName: 'Mr Customer_33',
      lastName: 'Customer_33',
      username: 'Customer_33',
      serviceArea: 'ACT',
      accountNo: 'Customer_33',
      isp: 'admin',
      connectionStatus: 'Offline',
      mobileNo: '9123456780',
      email: 'customer33@example.com',
      shiftFromCity: 'Mumbai',
      shiftToCity: 'Hyderabad',
      shiftingStartDate: '2026-04-18',
      shiftReachedDate: '2026-04-21',
      shiftCompleted: true
    },
    {
      customerId: 1003,
      firstName: 'Mr Customer_32',
      lastName: 'Customer_32',
      username: 'Customer_32',
      serviceArea: 'ACT',
      accountNo: 'Customer_32',
      isp: 'admin',
      connectionStatus: 'Offline',
      mobileNo: '9988776655',
      email: 'customer32@example.com',
      shiftFromCity: 'Delhi',
      shiftToCity: 'Jaipur',
      shiftingStartDate: '2026-04-30',
      shiftCompleted: false
    },
    {
      customerId: 1004,
      firstName: 'Mr Customer_30',
      lastName: 'Customer_30',
      username: 'Customer_30',
      serviceArea: 'ACT',
      accountNo: 'Customer_30',
      isp: 'admin',
      connectionStatus: 'Offline',
      mobileNo: '9000010030',
      email: 'customer30@example.com',
      shiftFromCity: 'Chennai',
      shiftToCity: 'Pune',
      shiftingStartDate: '2026-04-25',
      shiftCompleted: false
    },
    {
      customerId: 1005,
      firstName: 'Mr Customer_27',
      lastName: 'Customer_27',
      username: 'Customer_27',
      serviceArea: 'organization',
      accountNo: 'Customer_27',
      isp: 'admin',
      connectionStatus: 'Online',
      mobileNo: '9000010027',
      email: 'customer27@example.com',
      shiftFromCity: 'Ahmedabad',
      shiftToCity: 'Surat',
      shiftingStartDate: '2026-04-22',
      shiftCompleted: true
    }
  ];

  searchText = '';
  selectedArea = 'Any';
  selectedStatus = 'All';
  startDate = '';
  endDate = '';

  constructor() { }

  ngOnInit(): void {
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
}
