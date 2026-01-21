import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

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

    this.loginService.generateToken(this.credential).subscribe(res => {
      // this.loginService.loginUser(res.);
      this.router.navigate(['/dashboard']);
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


