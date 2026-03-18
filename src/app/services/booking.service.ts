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

  getTheaters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/theater/all`);
  }

  getTheaterById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/theater/${id}`);
  }

  getShows(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/show/all`);
  }

  getShowsByMovieId(movieId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/show/movie/${movieId}`);
  }

  bookTicket(ticketRequest: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ticket/addNew`, ticketRequest, { responseType: 'text' });
  }

  getUserTickets(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ticket/user/${userId}`);
  }

  rateTicket(ticketId: number, rating: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/ticket/${ticketId}/rate`, {}, { params: { rating: rating.toString() }, responseType: 'text' });
  }

  // Admin: Theaters
  addTheater(theaterRequest: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/theater/addNew`, theaterRequest, { responseType: 'text' });
  }

  addTheaterSeat(seatRequest: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/theater/addTheaterSeat`, seatRequest, { responseType: 'text' });
  }

  updateTheaterSeats(theaterId: number, seats: any[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/theater/${theaterId}/seats`, seats);
  }

  deleteTheater(theaterId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/theater/${theaterId}`, { responseType: 'text' });
  }

  // Admin: Shows
  addShow(showRequest: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/show/addNew`, showRequest, { responseType: 'text' });
  }

  associateShowSeats(seatRequest: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/show/associateSeats`, seatRequest, { responseType: 'text' });
  }

  updateShowSeats(showId: number, seats: any[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/show/${showId}/seats`, seats);
  }

  deleteShow(showId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/show/${showId}`, { responseType: 'text' });
  }
}

