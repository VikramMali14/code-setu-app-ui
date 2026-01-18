import { Component, OnInit } from '@angular/core';
import { EmailValidator } from '@angular/forms';
import { Router } from '@angular/router';
import { error } from 'console';
import { LoginService } from 'src/app/services/login.service';
import { StaffuserComponent } from '../staffuser/staffuser.component';
import { JwttokenService } from 'src/app/services/jwttoken.service';
import { StaffuserServiceService } from 'src/app/services/staffuser-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {


  creadential = {
    userName: '',
    password: '',
    email: ''
  }
  hidePassword = true;
  constructor(private loginservice: LoginService,
    private router: Router,
    private stafffuserservice: StaffuserServiceService,
    private jwtDecode: JwttokenService
  ) { }
  loginWithEmail = false;
  ngOnInit(): void {
  }


  onSubmit() {
    // Check if credentials exist
    const identifier = this.loginWithEmail ? this.creadential.email : this.creadential.userName;

    if (!identifier || !this.creadential.password) {
      alert("Please fill in all fields");
      return;
    }
    this.loginservice.generateToken(this.creadential).subscribe({
      next: (response: any) => {
      if (response?.accessToken) {
        this.loginservice.loginAndFetchUser(response.accessToken).subscribe({
          next:(staffId : any) =>{
             console.log('Staff Data Loaded:', staffId);
            this.router.navigate(['/dashboard']);
          }
        })
          this.loginservice.loginUser(response.accessToken);          
        } else {
          console.error("Token missing in response", response);
        }
      },
      error: (err) => {
        console.error("Login failed (Check CORS or Credentials):", err);
      }
    });
  }
}
