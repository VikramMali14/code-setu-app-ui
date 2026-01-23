import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENV } from 'src/assets/env';
import { Department } from '../models/department';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  constructor(private http: HttpClient) { }
  private BASE_URL = ENV.CARGO_SETU;


  delete(id: number) {
    return this.http.delete(`${this.BASE_URL}/api/v2/cargosetu/department/` + id);
  }

  // getAll(): Observable<{ data: Department[] }> {
  //   return this.http.get<{ data: Department[] }>(
  //     `${this.BASE_URL}/api/v2/cargosetu/department`
  //   );
  // }
  getAll(): Observable<{ dataList: Department[] }> {
    return this.http.get<{ dataList: Department[] }>(
      `${this.BASE_URL}/api/v2/cargosetu/department`
    );
  }



  createdepartment(payload: any) {
    return this.http.post<Department>(`${this.BASE_URL}/api/v2/cargosetu/department`, payload);
  }

  updatedepartmen(id: number, payload: any) {
    return this.http.put<Department>(
      `${this.BASE_URL}/api/v2/cargosetu/department/`+id,
      payload
    );
  }


}
