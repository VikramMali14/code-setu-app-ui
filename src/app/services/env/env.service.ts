// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class EnvService {

//   constructor() { }
// }


// src/app/env.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  private readonly env = window.__env || {};

  get apiUrl(): string {
    return this.env.apiUrl || 'http://default-api.com';
  }

  get enableDebug(): boolean {
    return this.env.enableDebug || false;
  }
}
