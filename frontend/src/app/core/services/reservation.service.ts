import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Reservation } from '../../store/reservation/reservation.state';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class ReservationsService {
  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  getAvailableSlots(field: string, date: string, duration: string): Observable<{ from: string; to: string }[]> {
    const params = new HttpParams()
      .set('field', field)
      .set('date', date)
      .set('duration', duration);
    return this.http.get<{ from: string; to: string }[]>(`${this.apiUrl}/availability`, { params });
  }

  getAll(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/my`);
  }

  getById(id: string): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  createReservation(reservation: Omit<Reservation, '_id' | 'slots'>): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservation);
  }

  updateReservation(id: string, dto: Partial<Reservation>): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}`, dto);
  }

  deleteReservation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
