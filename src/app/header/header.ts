import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isAdmin = false;

  constructor(public authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(() => {
      this.checkAdminRole();
    });
  }

  checkAdminRole() {
    const email = this.authService.getUserEmail();
    if (email) {
      this.authService.getUserByEmail(email).subscribe({
        next: (user) => {
          this.isAdmin = user?.roles?.includes('ADMIN') || false;
          this.cdr.detectChanges();
        },
        error: () => this.isAdmin = false
      });
    }
  }

  logout(event: Event) {
    event.stopPropagation();
    this.authService.logout();
    this.isAdmin = false;
    this.router.navigate(['/']);
  }
}
