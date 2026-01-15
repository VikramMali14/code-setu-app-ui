import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  constructor(private loginservice: LoginService) { }
  public loggedIn=false;


  ngOnInit(): void {
 this.loginservice.loggedIn$.subscribe(
      status => this.loggedIn = status
    );  }

  logoutUser(){
    this.loginservice.logout()
  }
}
