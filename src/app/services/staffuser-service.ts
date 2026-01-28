import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ENV } from 'src/assets/env';

@Injectable({
  providedIn: 'root'
})
export class StaffuserServiceService {

  constructor(private http: HttpClient) { }

  private BASE_URL = ENV.CARGO_SETU;
  getStaffById(staffId: any) {
    return this.http.get<any>(`${this.BASE_URL}/api/v2/cargosetu/staff/${staffId}`);
  }
  createStaff(payload: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}/auth/user/register`, payload);
  }
  // staff.service.ts
  private staffDetailsSubject = new BehaviorSubject<any>(null);
  staffDetails$ = this.staffDetailsSubject.asObservable(); // Components subscribe to this

  setStaffDetails(details: any) {
    this.staffDetailsSubject.next(details);
  }
  // staff.service.ts
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.loadingSubject.asObservable();

  setLoading(state: boolean) {
    this.loadingSubject.next(state);
  }

  profileUpload(staffId: any) {
    return this.http.post(`${this.BASE_URL}/api/v2/cargosetu/document/upload?/`,staffId);
  }

}
