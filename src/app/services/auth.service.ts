import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/user';
  private currentUserSubject = new BehaviorSubject<string | null>(this.getToken());

  constructor(private http: HttpClient) {}

  public get currentUserValue(): string | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/getToken`, credentials, { responseType: 'text' })
      .pipe(tap((token: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
        this.currentUserSubject.next(token);
      }));
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/addNew`, user, { responseType: 'text' });
  }

  logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
  }
}
