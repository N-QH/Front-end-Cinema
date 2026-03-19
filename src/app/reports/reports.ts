import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../services/admin.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  imports: [RouterLink, CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit, AfterViewInit {
  @ViewChild('revenueChart') revenueChartCanvas!: ElementRef;
  @ViewChild('theaterChart') theaterChartCanvas!: ElementRef;

  topMovies: any[] = [];
  revenueData: any[] = [];
  theaterRevenue: any[] = [];
  
  private revenueChart: any;
  private theaterChart: any;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadTopMovies();
    this.loadRevenueByDay();
    this.loadRevenueByTheater();
  }

  ngAfterViewInit() {
    // Charts will be initialized after data is loaded to ensure labels/data are present
  }

  loadTopMovies() {
    this.adminService.getTopMovies().subscribe(res => {
      this.topMovies = res;
      this.cdr.detectChanges();
    });
  }

  loadRevenueByDay() {
    this.adminService.getRevenueByDay().subscribe(res => {
      this.revenueData = res;
      this.initRevenueChart();
    });
  }

  loadRevenueByTheater() {
    this.adminService.getRevenueByTheater().subscribe(res => {
      this.theaterRevenue = res;
      this.initTheaterChart();
    });
  }

  initRevenueChart() {
    if (this.revenueChart) this.revenueChart.destroy();
    
    const isDark = document.body.classList.contains('dark-theme');
    const labelColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

    const ctx = this.revenueChartCanvas.nativeElement.getContext('2d');
    this.revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.revenueData.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('vi-VN', { weekday: 'short' });
        }),
        datasets: [{
          label: 'Doanh thu (₫)',
          data: this.revenueData.map(d => d.revenue),
          backgroundColor: '#7c3aed',
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            titleColor: isDark ? '#f8fafc' : '#1f2937',
            bodyColor: isDark ? '#f8fafc' : '#1f2937',
            borderColor: isDark ? '#334155' : '#e5e7eb',
            borderWidth: 1
          }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: gridColor },
            ticks: { color: labelColor }
          },
          x: { 
            grid: { display: false },
            ticks: { color: labelColor }
          }
        }
      }
    });
  }

  initTheaterChart() {
    if (this.theaterChart) this.theaterChart.destroy();
    
    const isDark = document.body.classList.contains('dark-theme');
    const labelColor = isDark ? '#f8fafc' : '#1f2937';

    const ctx = this.theaterChartCanvas.nativeElement.getContext('2d');
    this.theaterChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.theaterRevenue.map(d => d.theaterName),
        datasets: [{
          data: this.theaterRevenue.map(d => d.revenue),
          backgroundColor: [
            '#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'
          ],
          borderWidth: isDark ? 2 : 0,
          borderColor: isDark ? '#1e293b' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'bottom',
            labels: { color: labelColor }
          }
        },
        cutout: '70%'
      }
    });
  }
}
