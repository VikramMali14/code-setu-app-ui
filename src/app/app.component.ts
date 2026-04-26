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
  
  // Sidebar state
  isSidebarCollapsed = false;
  isMobileView = false;

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

  userdata: any;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private staffuserservice: StaffuserServiceService,
  ) {}

  ngOnInit(): void {
    // Load user data
    try {
      this.userdata = JSON.parse(localStorage.getItem('user_session') || '{}');
    } catch (error) {
      console.error('Error parsing user session:', error);
      this.userdata = {};
    }

    // Check viewport size
    this.checkViewport();

    // Set initial layout
    this.setLayout(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.setLayout(event.urlAfterRedirects);
        this.showProfileMenu = false; // Close profile menu on route change
        this.closeSidebarOnMobile(); // Close sidebar on mobile after navigation
      });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.showScrollButton = window.pageYOffset > 300;
  }

  @HostListener('window:resize')
  onResize() {
    this.checkViewport();
  }

  // Close profile menu when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const profileMenuWrap = document.querySelector('.profile-menu-wrap');
    
    if (profileMenuWrap && !profileMenuWrap.contains(target)) {
      this.showProfileMenu = false;
    }
  }

  // Check if viewport is mobile
  checkViewport() {
    const wasMobile = this.isMobileView;
    this.isMobileView = window.innerWidth <= 900;
    
    // Auto-adjust sidebar state based on viewport change
    if (this.isMobileView !== wasMobile) {
      if (this.isMobileView) {
        this.isSidebarCollapsed = true; // Hide on mobile by default
      } else {
        this.isSidebarCollapsed = false; // Show on desktop by default
      }
    }
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  navigate(path: string): void {
    if (path === 'quotations' || path === 'billing' || path === 'vehicles' || path === 'reports' || path === 'settings') {
      alert(`${path} module is currently under construction.`);
      return;
    }

    this.router.navigate([`/${path}`]);
    this.closeSidebarOnMobile();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  closeSidebar() {
    if (this.isMobileView) {
      this.isSidebarCollapsed = true;
    }
  }

  closeSidebarOnMobile() {
    if (this.isMobileView) {
      this.isSidebarCollapsed = true;
    }
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

  logout(): void {
    this.loginService.logout();
    this.closeProfileMenu();
  }

  goToStaffDetails(): void {
    console.log(this.userdata);
    
    if (!this.userdata || !this.userdata.staffId) {
      console.error('No staff ID found in user session');
      this.closeProfileMenu();
      return;
    }

    this.staffuserservice.getStaffById(this.userdata.staffId).subscribe({
      next: (response: GenericDataDTO) => {
        if (response && response.data) {
          // Set the data in the shared service
          this.staffuserservice.setStaffDetails(response);

          // Navigate to staff details
          this.router.navigate(['/staffdetails']);
          this.closeProfileMenu();
          this.closeSidebarOnMobile();
        }
      },
      error: (err) => {
        console.error("Error fetching staff profile:", err);
        this.closeProfileMenu();
      }
    });
  }

  goToEditProfile(): void {
    this.closeProfileMenu();
    this.router.navigate(['/staffuser']);
    this.closeSidebarOnMobile();
  }

  private setLayout(url: string): void {
    this.isInternalApp = this.loginService.isLoggedIn() && 
                         this.internalRoutes.some(route => url.startsWith(route));

    const session = localStorage.getItem('user_session');
    if (session) {
      try {
        const user = JSON.parse(session);
        this.username = user.userName || user.firstName || this.username;
      } catch (error) {
        console.error('Error parsing user session in setLayout:', error);
      }
    }
  }
}