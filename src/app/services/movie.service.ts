import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = environment.apiUrl + '/movie';

  constructor(private http: HttpClient) {}

  addMovie(movie: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/addNew`, movie, { responseType: 'text' });
  }

  getMovies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  getMovieById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  setMovieBanner(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/banner`, {}, { responseType: 'text' });
  }

  updateMovie(id: number, movie: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, movie, { responseType: 'text' });
  }

  deleteMovie(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}
