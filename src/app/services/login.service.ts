import { HttpClient } from '@angular/common/http';
import { Token } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// import { url } from 'inspector';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  generateToken(creadential: any) {
    return this.http.post('http://localhost:31201/auth/login', creadential);
  }

  loginUser(token: string) {
    if (!token) return false;

    localStorage.setItem('token', token);
    this.loggedInSubject.next(true);   
    return true;
  }

  logout() {
    localStorage.removeItem('token');
    this.loggedInSubject.next(false);  
  }

  isLoggedIn() {
    return this.hasToken();
  }
}