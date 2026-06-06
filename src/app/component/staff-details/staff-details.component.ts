import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GenericDataDTO } from 'src/app/models/generic-data-dto';
import { StaffuserServiceService } from 'src/app/services/staffuser-service';

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.css']
})
export class StaffDetailsComponent implements OnInit { staffList: any[] = [];
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  loading = false;
  searchTerm = '';
  filterStatus = '';
  filterType = '';

  Math = Math; // Make Math available in template
  userdata: any;

  constructor(
    private staffuserservice: StaffuserServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff() {
    this.loading = true;

    this.staffuserservice.getAllStaff(this.page, this.size).subscribe({
      next: (res: any) => {
        console.log('API Response:', res);

        if (res && res.data) {
          this.staffList = res.data.content || res.data;
          this.totalElements = res.data.totalElements || this.staffList.length;
          this.totalPages = res.data.totalPages || 1;
        } else {
          this.staffList = [];
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.loading = false;
        this.staffList = [];
      }
    });
  }

  onSearch() {
    // Implement search logic here
    // You can call a search API or filter locally
    this.page = 0;
    this.loadStaff();
  }

  onFilterChange() {
    // Implement filter logic here
    this.page = 0;
    this.loadStaff();
  }

  onPageSizeChange() {
    this.page = 0;
    this.loadStaff();
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadStaff();
    }
  }

  previousPage() {
    if (this.page > 0) {
      this.page--;
      this.loadStaff();
    }
  }

  goToFirstPage() {
    this.page = 0;
    this.loadStaff();
  }

  goToLastPage() {
    this.page = this.totalPages - 1;
    this.loadStaff();
  }

  viewStaff(staffId: number) {
    this.staffuserservice.getStaffById(staffId).subscribe({
      next: (response) => {
        this.staffuserservice.setStaffDetails(response);
        this.router.navigate(['/staffdetails']);
      },
      error: (err) => {
        console.error('Error fetching staff details:', err);
      }
    });
  }



  editStaff(staffId: number) {
    this.staffuserservice.getStaffById(staffId).subscribe({
      next: (response) => {
        // Store the staff data for editing
        localStorage.setItem('currentStaff', JSON.stringify(response.data));
        this.router.navigate(['/staffuser', staffId]);
      },
      error: (err) => {
        console.error('Error fetching staff details:', err);
      }
    });
  }

  deleteStaff(staffId: number) {
    if (confirm('Are you sure you want to remove this staff member?')) {
      // Implement delete API call
      console.log('Delete staff:', staffId);
      // this.staffuserservice.deleteStaff(staffId).subscribe({...});
    }
  }

  createNewStaff() {
    localStorage.removeItem('currentStaff');
    this.router.navigate(['/staffuser']);
  }


    goToStaffDetails(): void {
  console.log(this.userdata)
    this.staffuserservice.getStaffById(this.userdata.staffId).subscribe({
      next: (response: GenericDataDTO) => {
        if (response && response.data) {
          // 2. Set the data in the shared service
          this.staffuserservice.setStaffDetails(response);

          // 3. Navigate only AFTER data is successfully received and stored
          this.router.navigate(['/staffdetails']);
        }
      },
      error: (err) => {
        console.error("Error fetching staff profile:", err);
      }
    });
  }
}
