import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENV } from 'src/assets/env';

@Injectable({ providedIn: 'root' })
export class ShiftInventoryService {
  private readonly BASE_URL = `${ENV.CARGO_SETU}/api/v2/cargosetu/shift-inventory`;

  constructor(private http: HttpClient) {}

  getInventory(shiftId: number | string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/${shiftId}`);
  }

  createInventory(payload: any): Observable<any> {
    return this.http.post<any>(this.BASE_URL, payload);
  }

  updateInventory(id: number | string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.BASE_URL}/${id}`, payload);
  }

  updateStatus(id: number | string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.BASE_URL}/${id}/status`, { status });
  }

  deleteInventory(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.BASE_URL}/${id}`);
  }
}
