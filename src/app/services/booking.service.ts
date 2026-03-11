import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTheaters(): Observable<any> {
    return this.http.get(`${this.apiUrl}/theater/getAll`);
  }

  getShows(): Observable<any> {
    return this.http.get(`${this.apiUrl}/show/getAll`);
  }

  bookTicket(ticketRequest: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ticket/addNew`, ticketRequest, { responseType: 'text' });
  }
}
