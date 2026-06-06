import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ENV } from 'src/assets/env';
import { Plandto } from '../models/plandto';
import { Observable } from 'rxjs';
import { GenericDataDTO } from '../models/generic-data-dto';

@Injectable({
  providedIn: 'root'
})
export class PlanserviceService {
  private BASE_URL = ENV.CARGO_SETU;

  // baseUrl = ENV.CARGO_SETU+"/api/v2/cargosetu/";
  constructor(private http: HttpClient) { }

  getPlanList() {
    return this.http.get<any>(`${this.BASE_URL}/api/v2/cargosetu/plan`)
  }
  
  getPublicPlanList() {
    return this.http.get<any>(`${this.BASE_URL}/public/plan`)
  }

  createPlane(dto: Plandto) {
    return this.http.post<GenericDataDTO>(`${this.BASE_URL}/api/v2/cargosetu/plan`, dto)
  }
  deletePlane(id: number) {
    return this.http.delete<GenericDataDTO>(
      `${this.BASE_URL}/api/v2/cargosetu/plan/` + id
    );
  }
    updatePlane(id:number,dto: Plandto) {
    return this.http.put<GenericDataDTO>(`${this.BASE_URL}/api/v2/cargosetu/plan/`+id, dto)
  }

}
