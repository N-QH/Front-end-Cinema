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
          backgroundColor: 'rgba(124, 58, 237, 0.8)',
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, grid: { display: false } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  initTheaterChart() {
    if (this.theaterChart) this.theaterChart.destroy();
    
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
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        cutout: '70%'
      }
    });
  }
}
