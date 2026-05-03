import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/auth`;

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials);
    }

    register(dto: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, dto);
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { email });
    }

    getMe(): Observable<any> {
        return this.http.get(`${this.apiUrl}/me`);
    }
}
