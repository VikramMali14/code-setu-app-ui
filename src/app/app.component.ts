import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoginService } from './services/login.service';
import { StaffuserServiceService } from './services/staffuser-service';
import { GenericDataDTO } from './models/generic-data-dto';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'cargo-set-ui';
  showScrollButton = false;
  isInternalApp = false;
  username = 'SUPERADMIN';
  showProfileMenu = false;

  private internalRoutes = [
    '/dashboard',
    '/customers',
    '/department',
    '/staffdetails',
    '/staffuser',
    '/roles',
    '/createrole',
    '/updaterole',
    '/plan',
    '/createplan'
  ];

  constructor(
    private router: Router,
    private loginService: LoginService,
        private staffuserservice: StaffuserServiceService,
  ) {}

  ngOnInit(): void {
    this.setLayout(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => this.setLayout(event.urlAfterRedirects));
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    // Show button when user scrolls down 300px from top
    this.showScrollButton = window.pageYOffset > 300;
  }
   scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
    userdata = JSON.parse(localStorage.getItem('user_session') || "");


  navigate(path: string): void {
    if (path === 'quotations' || path === 'billing' || path === 'vehicles' || path === 'reports' || path === 'settings') {
      alert(`${path} module is currently under construction.`);
      return;
    }

    this.router.navigate([`/${path}`]);
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

  logout(): void {
    this.loginService.logout();
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

  goToEditProfile(): void {
    this.closeProfileMenu();
    this.router.navigate(['/staffuser']);
  }

  private setLayout(url: string): void {
    this.isInternalApp = this.loginService.isLoggedIn() && this.internalRoutes.some(route => url.startsWith(route));

    const session = localStorage.getItem('user_session');
    if (session) {
      const user = JSON.parse(session);
      this.username = user.userName || user.firstName || this.username;
    }
  }
  isSidebarCollapsed = false;

toggleSidebar() {
  this.isSidebarCollapsed = !this.isSidebarCollapsed;
}
}
