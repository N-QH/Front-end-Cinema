import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/user';
  private currentUserSubject = new BehaviorSubject<string | null>(this.getToken());
  public currentUser$ = this.currentUserSubject.asObservable();

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

  getUserEmail(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.sub;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  getUserByEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/email/${email}`);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { responseType: 'text' })
      .pipe(tap((token: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
        this.currentUserSubject.next(token);
      }));
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user, { responseType: 'text' })
      .pipe(tap((token: string) => {
        // If the backend returns a token, we handle it exactly like login
        if (token && token.length > 50) { 
           if (typeof window !== 'undefined') {
               localStorage.setItem('token', token);
           }
           this.currentUserSubject.next(token);
        }
      }));
  }

  logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
  }

  getUserProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`);
  }

  updateProfile(userId: number, userRequest: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, userRequest, { responseType: 'text' });
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  toggleLock(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/toggleLock`, {}, { responseType: 'text' });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`, { responseType: 'text' });
  }

  changeUserPassword(userId: number, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/password`, { newPassword }, { responseType: 'text' });
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email: email }, { responseType: 'text' });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data, { responseType: 'text' });
  }

  toggleOneTap(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/toggle-one-tap`, {}, { responseType: 'text' });
  }

  addPaymentMethod(userId: number, token: string | null): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/add-payment-method`, { token }, { responseType: 'text' });
  }
}

