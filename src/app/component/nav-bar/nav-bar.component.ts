import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  constructor(private loginservice: LoginService,
    private router:Router
  ) { }
  loggedIn: boolean = false;
  userId: string = '';
    username: string = '';

    public mobileMenuOpen = false;
  public servicesSubmenuOpen = false;

   ngOnInit(): void {
    this.loginservice.loggedIn$.subscribe(status => {
      this.loggedIn = status;
      
      if (status) {
        // Retrieve user info from localStorage if status is true
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        this.userId = userData.id || 'User_01'; // Default if ID is missing
         this.userId = userData.username || 'User_01';
      } else {
        this.userId = ''; // Reset when logged out
      }
    });
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    this.servicesSubmenuOpen = false;
  }

  toggleServicesSubmenu() {
    this.servicesSubmenuOpen = !this.servicesSubmenuOpen;
  }
  logoutUser() {
    this.loginservice.logout()
  }
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (!this.mobileMenuOpen) {
      this.servicesSubmenuOpen = false;
    }
  }
  
goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToEditProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  goToSecurity(): void {
    this.router.navigate(['/security']);
  }

  goToPrivacy(): void {
    this.router.navigate(['/privacy']);
  }


}
