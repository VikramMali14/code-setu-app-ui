import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ENV } from 'src/assets/env';

@Injectable({
  providedIn: 'root'
})
export class RoleserviceService {
  private BASE_URL = ENV?.CARGO_SETU;
  constructor(private http: HttpClient) { }
   saveRole(role: any) {
     if (!this.BASE_URL) {
      throw new Error('BASE_URL is undefined');
    }
  return this.http.post(`${this.BASE_URL}/role`, role);
}


}
