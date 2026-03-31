import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, take, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    // Wait for the user profile to be loaded if a token exists
    return this.authService.userProfile$.pipe(
      filter(user => {
        // If no token, we can proceed (it will be null)
        // If token exists, wait until user is not null
        const hasToken = !!this.authService.getToken();
        return !hasToken || user !== null;
      }),
      take(1),
      map(user => {
        if (user && user.roles && user.roles.includes('ADMIN')) {
          return true;
        }
        
        // If not admin, redirect to home
        return this.router.createUrlTree(['/']);
      })
    );
  }
}
