import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaffuserServiceService } from 'src/app/services/staffuser-service';

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.css']
})
export class StaffDetailsComponent implements OnInit {
goBack() {
throw new Error('Method not implemented.');
}
  staffData: any = null;

  constructor(
    private staffuserservice: StaffuserServiceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to the shared data stream
    this.staffuserservice.staffDetails$.subscribe(data => {
      if (data) {
        this.staffData = data;
      } else {
        // Optional: Redirect if no data is found (e.g., direct page refresh)
        // this.router.navigate(['/dashboard']);
      }
    });
  }

  onEdit() {
    this.router.navigate(['/staffuser']); // Navigate to your form component
  }
  // nav-bar.component.ts
viewProfile(id: number) {
  this.staffuserservice.setLoading(true); // Start Loader

  this.staffuserservice.getStaffById(id).subscribe({
    next: (response) => {
      this.staffuserservice.setStaffDetails(response);
      this.router.navigate(['/staff-details']);
    },
    error: (err) => {
      console.error(err);
      this.staffuserservice.setLoading(false);
    },
    complete: () => {
      // Delay slightly for smooth transition if API is too fast
      setTimeout(() => this.staffuserservice.setLoading(false), 500);
    }
  });
}

}
