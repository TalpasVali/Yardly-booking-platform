import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Sport } from '../../store/sports/sports.model';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class SportsService {
  private apiUrl = `${environment.apiUrl}/sports`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Sport[]> {
    return this.http.get<Sport[]>(this.apiUrl);
  }

  getById(id: string): Observable<Sport> {
    return this.http.get<Sport>(`${this.apiUrl}/${id}`);
  }

  create(formData: FormData): Observable<Sport> {
    return this.http.post<Sport>(this.apiUrl, formData);
  }

  update(id: string, formData: FormData): Observable<Sport> {
    return this.http.patch<Sport>(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
