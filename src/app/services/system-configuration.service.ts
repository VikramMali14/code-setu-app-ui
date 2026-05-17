import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENV } from 'src/assets/env';

@Injectable({
  providedIn: 'root'
})
export class SystemConfigurationService {
  private readonly BASE_URL = `${ENV.CARGO_SETU}/api/v2/cargosetu/system/configuration`;

  constructor(private http: HttpClient) {}

  getConfigurations(): Observable<any> {
    return this.http.get<any>(this.BASE_URL);
  }

  getConfigurationById(id: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/${id}`);
  }

  createConfiguration(payload: any): Observable<any> {
    return this.http.post<any>(this.BASE_URL, payload);
  }

  updateConfiguration(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.BASE_URL}/${id}`, payload);
  }

  deleteConfiguration(id: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE_URL}/${id}`);
  }
}
