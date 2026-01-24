import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse } from 'src/app/models/authresponse';
import { LoginService } from 'src/app/services/login.service';
import { LoaderComponent } from '../loader/loader.component';

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
    private router: Router
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
    this.isLoading = true; // Start loader


    this.loginService.generateToken(this.credential).subscribe({
      next: (response: AuthResponse) => {
        console.log('Login response:', response);

        const success = this.loginService.loginUser(response.accessToken);

        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          alert('Login failed: invalid token');
        }
      },
      error: (err) => {
        console.error('Login API error', err);
        alert('Invalid credentials');
        this.isLoading = false; // Hide loader on error
      },
      complete: () => {
        // This ensures the loader hides if navigation doesn't happen immediately
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


