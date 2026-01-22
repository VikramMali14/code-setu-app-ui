import { HttpClient } from '@angular/common/http';
import { Token } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { JwttokenService } from './jwttoken.service';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { StaffuserServiceService } from './staffuser-service';
import { tap } from 'rxjs/operators'; // Required to use tap in .pipe()
import { ENV } from 'src/assets/env';
import { AuthResponse } from '../models/authresponse';

// import { url } from 'inspector';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  loggedIn$ = this.loggedInSubject.asObservable();

  private BASE_URL = ENV.CARGO_SETU;
  constructor(private http: HttpClient,
    private jwtdecode: JwttokenService,
    private staffuserservice:StaffuserServiceService
  ) { }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  generateToken(creadential: any) {
    return this.http.post<AuthResponse>(`${this.BASE_URL}/auth/login`, creadential);
  }

  // loginUser(token: string) {
  //   if (!token) return false;

  //   localStorage.setItem('token', token);
  //   this.loggedInSubject.next(true);   

  //   return true;
  // }



  loginUser(token: string): boolean {
    if (!token) return false;

    try {
      localStorage.setItem('token', token);

      const decoded: JwtPayload = jwtDecode<JwtPayload>(token);
      console.log('Decoded Token:', decoded);

      // Check if exp exists first
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        this.logout();
        return false;
      }
      if (token) {
        const decoded = this.jwtdecode.getDecodedToken(); // Ensure variable name match (jwtdecode)
        if (decoded && decoded.sub) {
          this.staffuserservice.getStaffById(decoded.sub); // Pass the correct ID/sub field
        }
      }

      this.loggedInSubject.next(true);
      return true;

    } catch (error) {
      console.error('Invalid JWT Token', error);
      return false;
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.loggedInSubject.next(false);
  }

  isLoggedIn() {
    return this.hasToken();
  }

  loginAndFetchUser(token: string): Observable<any> {
  localStorage.setItem('token', token);
  const decoded: any = jwtDecode(token);

  if (decoded && decoded.sub) {
    return this.staffuserservice.getStaffById(decoded.sub).pipe(
      // Explicitly type staffData to satisfy TypeScript strict mode
      tap((staffData: any) => { 
        this.loggedInSubject.next(true);
        localStorage.setItem('staffInfo', JSON.stringify(staffData));
      })
    );
  }
  // Use return throwError for error handling in RxJS
  return throwError(() => new Error('Invalid Token Payload'));
}

}