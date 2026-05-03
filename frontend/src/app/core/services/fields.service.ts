import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Field } from '../../store/fields/fields.state';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class FieldsService {
  private apiUrl = `${environment.apiUrl}/fields`;

  constructor(private http: HttpClient) {}

  getAllFields(): Observable<Field[]> {
    return this.http.get<Field[]>(this.apiUrl);
  }

  getFieldById(id: string): Observable<Field> {
    return this.http.get<Field>(`${this.apiUrl}/${id}`);
  }

  createField(data: FormData): Observable<Field> {
    return this.http.post<Field>(this.apiUrl, data);
  }

  updateField(id: string, data: FormData): Observable<Field> {
    return this.http.patch<Field>(`${this.apiUrl}/${id}`, data);
  }

  deleteField(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
