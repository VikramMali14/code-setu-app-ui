import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENV } from 'src/assets/env';

export interface DriverPayload {
  id?: number;
  name: string;
  phoneNumber: string;
  email: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  experienceYears: number;
  address: string;
  status: string;
  joiningDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private readonly BASE_URL = `${ENV.CARGO_SETU}/api/v2/cargosetu/drivers`;

  constructor(private http: HttpClient) {}

  getDrivers(): Observable<any> {
    return this.http.get<any>(this.BASE_URL);
  }

  getDriver(id: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/${id}`);
  }

  createDriver(payload: DriverPayload): Observable<any> {
    return this.http.post<any>(this.BASE_URL, payload);
  }

  updateDriver(id: number, payload: DriverPayload): Observable<any> {
    return this.http.put<any>(`${this.BASE_URL}/${id}`, payload);
  }

  deleteDriver(id: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE_URL}/${id}`);
  }
}
