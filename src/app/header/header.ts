import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(public authService: AuthService, private router: Router) {}

  logout(event: Event) {
    event.stopPropagation();
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
