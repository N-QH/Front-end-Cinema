import { Component, OnInit, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-header',
  imports: [CommonModule],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.css'
})
export class AdminHeaderComponent implements OnInit {
  adminName = 'Admin';
  adminImage = '';
  
  notifications: any[] = [];
  showNotifications = false;
  unreadCount = 0;

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    private eRef: ElementRef
  ) {}

  ngOnInit() {
    this.authService.userProfile$.subscribe(u => {
      if (u) { 
        this.adminName = u.name || 'Admin'; 
        this.adminImage = u.userImage || ''; 
        this.cdr.detectChanges(); 
      }
    });

    this.fetchNotifications();
  }

  fetchNotifications() {
    this.adminService.getNotifications().subscribe({
      next: (res) => {
        this.notifications = res || [];
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching notifications', err);
      }
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  readAll() {
    this.adminService.markAllNotificationsAsRead().subscribe(() => {
      this.notifications.forEach(n => n.read = true);
      this.unreadCount = 0;
      this.cdr.detectChanges();
    });
  }

  markAsRead(notification: any) {
    if (!notification.read) {
      this.adminService.markNotificationAsRead(notification.id).subscribe(() => {
        notification.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.cdr.detectChanges();
      });
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showNotifications = false;
    }
  }
}
