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
}
