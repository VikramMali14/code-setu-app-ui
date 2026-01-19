import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Role } from 'src/app/models/role';
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
  public getroleById(id: number): Observable<Role> {
    return this.http.get<any>(this.BASE_URL + "/role/" + id)
      .pipe(map(response => response.data))
  }

  updaterols(role: Role): Observable<Object> {
    return this.http.put(this.BASE_URL + "/update", role);
  }
  updateEmployee(role: Role): Observable<Object> {
    return this.http.put(this.BASE_URL + "/update", role);
  }
  deleteEmployee(id: number): Observable<Object> {
    return this.http.delete(this.BASE_URL + "/delete" + "?id=" + id);
  }
  getEmployee(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.BASE_URL + "/getAll"}`)
  }
}
