import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  getRevenueByDay(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/revenue-by-day`);
  }

  getTopMovies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-movies`);
  }

  getRevenueByTheater(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/revenue-by-theater`);
  }
}
