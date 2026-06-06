import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENV } from 'src/assets/env';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private readonly BASE_URL = `${ENV.CARGO_SETU}/api/v2/cargosetu/assignments`;

  constructor(private http: HttpClient) {}

  assignVehicleToDriver(driverId: number, vehicleId: number): Observable<any> {
    const params = new HttpParams()
      .set('driverId', driverId)
      .set('vehicleId', vehicleId);

    return this.http.post<any>(this.BASE_URL, null, { params });
  }

  unassign(id: number): Observable<any> {
    return this.http.put(`${this.BASE_URL}/unassign/${id}`, null, { responseType: 'text' });
  }
}
