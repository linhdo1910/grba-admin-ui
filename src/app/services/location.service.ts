import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private baseUrl = 'https://provinces.open-api.vn/api';

  constructor(private http: HttpClient) { }

  getProvinces(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/p`);
  }

  getDistricts(provinceCode: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/p/${provinceCode}?depth=2`);
  }

  getWards(districtCode: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/d/${districtCode}?depth=2`);
  }
}
