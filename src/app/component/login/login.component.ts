import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthResponse } from 'src/app/models/authresponse';
import { LoginService } from 'src/app/services/login.service';
import { LoaderComponent } from '../loader/loader.component';
import { switchMap, tap } from 'rxjs';
import { StaffuserServiceService } from 'src/app/services/staffuser-service';
import { JwttokenService } from 'src/app/services/jwttoken.service';
import { CompanyService } from 'src/app/services/company.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogboxComponent } from '../dialogbox/dialogbox.component';
import { ENV } from 'src/assets/env';

declare const google: any;

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
export class LoginComponent implements OnInit, AfterViewInit {
  isLoading = false; // Add this property

  credential = {
    email: '',
    userName: '',
    password: ''
  };

  hidePassword = true;
  userExists: boolean | null = null;
  checkingEmail = false;

  countryCodes: any[] = [
    { name: 'India', code: '+91', cca2: 'IN' },
    { name: 'USA', code: '+1', cca2: 'US' },
    { name: 'UK', code: '+44', cca2: 'GB' },
    { name: 'UAE', code: '+971', cca2: 'AE' }
  ];

  constructor(
    private loginService: LoginService,
    private router: Router,
    private http: HttpClient,
    private companyService: CompanyService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadCountryCodes();
  }

  ngAfterViewInit(): void {
    this.initGoogleSignIn();
  }

  private googleInitialized = false;

  private initGoogleSignIn(): void {
    const clientId = ENV?.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('GOOGLE_CLIENT_ID is not configured; Google login is disabled.');
      return;
    }
    if (typeof google === 'undefined') {
      // GSI script may not have loaded yet - retry shortly.
      setTimeout(() => this.initGoogleSignIn(), 300);
      return;
    }

    if (!this.googleInitialized) {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => this.handleGoogleCredential(response)
      });
      this.googleInitialized = true;
    }

    this.renderGoogleButton();
  }

  private renderGoogleButton(): void {
    // The OTP tab's content isn't in the DOM until it's selected at least once
    // (mat-tab-group lazily renders inactive tabs), so retry until the div shows up.
    const target = document.getElementById('googleSignInDiv');
    if (target) {
      target.innerHTML = '';
      google.accounts.id.renderButton(target, {
        theme: 'outline',
        size: 'large',
        width: 280,
        text: 'continue_with'
      });
    } else {
      setTimeout(() => this.renderGoogleButton(), 300);
    }
  }

  onTabChange(): void {
    if (this.googleInitialized) {
      this.renderGoogleButton();
    }
  }

  handleGoogleCredential(response: any) {
    if (!response?.credential) {
      alert('Google sign-in failed. Please try again.');
      return;
    }
    this.isLoading = true;
    this.loginService.googleLogin(response.credential).pipe(
      switchMap((tokenResponse: AuthResponse) => {
        return this.loginService.loginAndFetchUser(tokenResponse.accessToken);
      })
    ).subscribe({
      next: () => {
        this.companyService.getCurrentCompany().subscribe({
          next: (res) => {
            if (res && res.responseCode === 200 && res.data) {
              this.router.navigate(['/dashboard']);
            } else {
              this.showNoCompanyDialog();
            }
          },
          error: (err) => {
            console.warn('getCurrentCompany failed, likely no company bound:', err);
            this.showNoCompanyDialog();
          }
        });
      },
      error: (err) => {
        console.error('Google login failed', err);
        alert(err.error?.message || 'Google login failed');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  otp = {
    mobileCode: '+91',
    mobile: '',
    code: ''
  };
  otpSent = false;

  checkEmailExists() {
    const email = this.credential.email?.trim();
    if (!email) {
      this.userExists = null;
      return;
    }
    this.checkingEmail = true;
    this.loginService.checkUserExists(email).subscribe({
      next: (res) => {
        this.userExists = res.exists;
        this.checkingEmail = false;
        if (!res.exists) {
          this.router.navigate(['/signup'], { queryParams: { email } });
        }
      },
      error: () => {
        // Don't block login on a failed check - let the actual login call be the source of truth.
        this.userExists = null;
        this.checkingEmail = false;
      }
    });
  }

  loginWithEmail() {
    if (!this.credential.email || !this.credential.password) {
      alert('Missing fields');
      return;
    }
    this.isLoading = true;

    this.loginService.generateToken(this.credential).pipe(
      switchMap((response: AuthResponse) => {
        return this.loginService.loginAndFetchUser(response.accessToken);
      })
    ).subscribe({
      next: (userDetails) => {
        console.log('User Details fetched:', userDetails);
        this.companyService.getCurrentCompany().subscribe({
          next: (res) => {
            if (res && res.responseCode === 200 && res.data) {
              this.router.navigate(['/dashboard']);
            } else {
              this.showNoCompanyDialog();
            }
          },
          error: (err) => {
            console.warn('getCurrentCompany failed, likely no company bound:', err);
            this.showNoCompanyDialog();
          }
        });
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

  showNoCompanyDialog() {
    const dialogRef = this.dialog.open(DialogboxComponent, {
      width: '450px',
      disableClose: true,
      data: {
        title: 'Create Your First Company',
        message: 'It looks like you do not have any company associated with your account. Would you like to create one now?',
        confirmText: 'Create Company',
        cancelText: 'Skip'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.router.navigate(['/company-create']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    });
  }



  sendOtp() {
    if (!this.otp.mobile) {
      alert('Enter mobile number');
      return;
    }
    this.isLoading = true;
    this.loginService.sendOtp(this.otp.mobile).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.otpSent = true;
        alert('Your mockOtp is : ' + res.mockOtp);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Send OTP failed', err);
        alert(err.error?.message || 'Failed to send OTP. Is the number registered?');
      }
    });
  }

  verifyOtp() {
    if (!this.otp.code || this.otp.code.length !== 6) {
      alert('Invalid OTP');
      return;
    }
    this.isLoading = true;
    this.loginService.verifyOtp(this.otp.mobile, this.otp.code).pipe(
      switchMap((response: AuthResponse) => {
        return this.loginService.loginAndFetchUser(response.accessToken);
      })
    ).subscribe({
      next: (userDetails) => {
        this.isLoading = false;
        console.log('User Details fetched:', userDetails);
        this.companyService.getCurrentCompany().subscribe({
          next: (res) => {
            if (res && res.responseCode === 200 && res.data) {
              this.router.navigate(['/dashboard']);
            } else {
              this.showNoCompanyDialog();
            }
          },
          error: (err) => {
            console.warn('getCurrentCompany failed, likely no company bound:', err);
            this.showNoCompanyDialog();
          }
        });
      },
      error: (err) => {
        console.error('Verify OTP failed', err);
        alert(err.error?.message || 'Invalid or expired OTP');
        this.isLoading = false;
      }
    });
  }

  loadCountryCodes() {
    this.http.get<any[]>('https://restcountries.com/v3.1/all?fields=name,idd,cca2').subscribe({
      next: (countries) => {
        if (Array.isArray(countries)) {
          this.countryCodes = countries
            .map(c => {
              const root = c.idd?.root || '';
              const suffix = c.idd?.suffixes?.[0] || '';
              return {
                name: c.name?.common || '',
                code: root + suffix,
                cca2: c.cca2 || ''
              };
            })
            .filter(c => c.name && c.code)
            .sort((a, b) => a.name.localeCompare(b.name));
        }
      },
      error: (err) => {
        console.error('Failed to load country codes', err);
      }
    });
  }
}


