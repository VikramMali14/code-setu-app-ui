import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JwttokenService {

  private loggedInSubject = new BehaviorSubject<boolean>(false);
  loggedIn$ = this.loggedInSubject.asObservable();

  constructor() {}

  loginUser(token: string): boolean {
    if (!token) return false;

    try {

      const decoded: JwtPayload = jwtDecode<JwtPayload>(token);
      console.log('Decoded Token:', decoded);

      // Expiry check
      if (decoded.exp * 1000 < Date.now()) {
        this.logout();
        return false;
      }
localStorage.setItem('token', token);
      this.loggedInSubject.next(true);
      return true;

    } catch (error) {
      console.error('Invalid JWT Token', error);
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.loggedInSubject.next(false);
  }

  getDecodedToken(): JwtPayload | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }
  printTokenValues(token: string): void {
  try {
    const decoded: JwtPayload = jwtDecode<JwtPayload>(token);

    console.log('✅ JWT Payload:', decoded);
    console.log('👤 Username (sub):', decoded.sub);
    console.log('🧑 Role:', decoded.role);
    console.log('⏰ Issued At:', new Date(decoded.iat * 1000));
    console.log('⌛ Expiry Time:', new Date(decoded.exp * 1000));
    console.log('❌ Is Expired:', decoded.exp * 1000 < Date.now());

  } catch (error) {
    console.error('Invalid JWT Token', error);
  }
}
}
