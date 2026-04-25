import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV } from 'src/assets/env';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private BASE_URL = ENV.CARGO_SETU;

  constructor(private http: HttpClient) { }

  getCustomers(): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/api/v2/cargosetu/customer`);
  }

  createCustomer(payload: any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/api/v2/cargosetu/customer`, payload);
  }
}
