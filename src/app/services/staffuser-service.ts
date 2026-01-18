import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ENV } from 'src/assets/env';

@Injectable({
  providedIn: 'root'
})
export class StaffuserServiceService {

 constructor(private http: HttpClient ) { }
  
  private BASE_URL = ENV.CARGO_SETU;
  getStaffById(staffId: any) {
  return this.http.get(`${this.BASE_URL}/api/v2/cargosetu/staff/${staffId}`);
}}
