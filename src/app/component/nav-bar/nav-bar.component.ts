import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  constructor(private loginservice: LoginService) { }
  public loggedIn = false;
  public mobileMenuOpen = false;
  public servicesSubmenuOpen = false;

  ngOnInit(): void {
 this.loginservice.loggedIn$.subscribe(
      status => this.loggedIn = status
    );  }

    closeMobileMenu() {
    this.mobileMenuOpen = false;
    this.servicesSubmenuOpen = false;
  }

  toggleServicesSubmenu() {
    this.servicesSubmenuOpen = !this.servicesSubmenuOpen;
  }
  logoutUser(){
    this.loginservice.logout()
  }
    toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (!this.mobileMenuOpen) {
      this.servicesSubmenuOpen = false;
    }
  }
}
