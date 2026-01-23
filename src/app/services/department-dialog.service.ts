import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENV } from 'src/assets/env';

@Injectable({
  providedIn: 'root'
})
export class DepartmentDialogService {
  private BASE_URL = ENV.CARGO_SETU;

  constructor(private http : HttpClient) { }
    delete(id: number) {
      return this.http.delete(`${this.BASE_URL}api/v2/cargosetu/department/`+id);
    }
    getAll(): Observable<any[]> {
      return this.http.get<any[]>(`${this.BASE_URL}api/v2/cargosetu/department`);
    }
}
