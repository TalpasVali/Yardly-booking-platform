import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { City } from '../../store/city/city.state';
import { environment } from '../../../enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class CityService {
  private apiUrl = `${environment.apiUrl}/cities`;

  constructor(private http: HttpClient) {}

  getAllCities(): Observable<City[]> {
    return this.http.get<City[]>(this.apiUrl);
  }

  getCityById(id: string): Observable<City> {
    return this.http.get<City>(`${this.apiUrl}/${id}`);
  }

  createCity(dto: Partial<City>): Observable<City> {
    return this.http.post<City>(this.apiUrl, dto);
  }

  updateCity(id: string, dto: Partial<City>): Observable<City> {
    return this.http.patch<City>(`${this.apiUrl}/${id}`, dto);
  }

  deleteCity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
