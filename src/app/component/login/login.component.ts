import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse } from 'src/app/models/authresponse';
import { LoginService } from 'src/app/services/login.service';
import { LoaderComponent } from '../loader/loader.component';
import { switchMap, tap } from 'rxjs';
import { StaffuserServiceService } from 'src/app/services/staffuser-service';
import { JwttokenService } from 'src/app/services/jwttoken.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('cardAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class LoginComponent {
  isLoading = false; // Add this property

  credential = {
    email: '',
    userName: '',
    password: ''
  };

  hidePassword = true;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private staffuserservice: StaffuserServiceService,
    private jwtDecode: JwttokenService
  ) { }

  otp = {
    mobile: '',
    code: ''
  };
  otpSent = false;

  loginWithEmail() {
    if (!this.credential.email || !this.credential.password) {
      alert('Missing fields');
      return;
    }
    this.isLoading = true;

    this.loginService.generateToken(this.credential).pipe(
      // 1. Success: Store the token first
      tap((response: AuthResponse) => {
        this.loginService.loginUser(response.accessToken);
        this.router.navigate(['/dashboard']);

      }),
      // 2. Switch to the next API call (getById)
      switchMap((response: AuthResponse) => {
        const decode = this.jwtDecode.getDecodedToken();

        // Pass the userId (adjust property name based on your API)
        return this.staffuserservice.getStaffById(decode?.sub);
      })
    ).subscribe({
      next: (userDetails) => {
        console.log('User Details fetched:', userDetails);
      },
      error: (err) => {
        console.error('API Error:', err);
        alert('Login or Profile fetch failed');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }



  verifyOtp() {
    if (!this.otp.code || this.otp.code.length !== 6) {
      alert('Invalid OTP');
      return;
    }


    // CALL BACKEND HERE
    console.log('OTP sent to', this.otp.mobile);
    this.otpSent = true;

  }
  sendOtp() {
    if (!this.otp.mobile) {
      alert('Enter mobile number');
      return;
    }
  }
}


