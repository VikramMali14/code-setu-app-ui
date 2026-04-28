import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Role } from 'src/app/models/role';
import { ENV } from 'src/assets/env';

@Injectable({
  providedIn: 'root'
})
export class RoleserviceService {

  private BASE_URL = ENV?.CARGO_SETU+"/api/v2/cargosetu";
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

  createRole(role: any): Observable<Object> {
    return this.http.post(this.BASE_URL + "/role", role);
  }
  updateRole(role: any): Observable<Object> {
    return this.http.put(this.BASE_URL + "/role", role);
  }
  deleteRole(id: number): Observable<Object> {
    return this.http.delete(this.BASE_URL + "/role/" + id);
  }
  getRole(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.BASE_URL + "/role"}`)
  }
  getPermissions(): Observable<Role[]> {
    return this.http.get<any[]>(`${this.BASE_URL + "/permission"}`)
  }
  getPermissionById(id: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/permission/${id}`);
  }
  createPermission(permission: any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/permission`, permission);
  }
  updatePermission(id: number, permission: any): Observable<any> {
    return this.http.put<any>(`${this.BASE_URL}/permission/${id}`, permission);
  }
  deletePermission(id: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE_URL}/permission/${id}`);
  }
}
