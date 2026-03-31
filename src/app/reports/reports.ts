import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';
import { Chart, registerables } from 'chart.js';
import { AdminHeaderComponent } from '../admin-header/admin-header';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  imports: [RouterLink, CommonModule, AdminHeaderComponent],
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

  constructor(private adminService: AdminService, private authService: AuthService, private cdr: ChangeDetectorRef) {}

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
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

  exportToExcel() {
    // UTF-8 BOM helps Excel recognize the file correctly
    const BOM = "\uFEFF";
    let csvContent = BOM + "BÁO CÁO DOANH THU RẠP CHIẾU PHIM\n\n";

    // 1. Top Movies
    csvContent += "TOP PHIM DOANH THU CAO NHẤT\n";
    csvContent += "Tên Phim,Doanh Thu\n";
    this.topMovies.forEach(movie => {
       csvContent += `"${movie.movieName}","${movie.revenue}"\n`;
    });
    csvContent += "\n";

    // 2. Revenue By Day
    csvContent += "DOANH THU THEO NGÀY\n";
    csvContent += "Ngày,Doanh Thu\n";
    this.revenueData.forEach(d => {
       // Using ="value" forces Excel to treat it as a literal string
       csvContent += `="""${d.date}""","${d.revenue}"\n`;
    });
    csvContent += "\n";

    // 3. Revenue By Theater
    csvContent += "DOANH THU THEO RẠP\n";
    csvContent += "Tên rạp,Doanh Thu\n";
    this.theaterRevenue.forEach(t => {
       csvContent += `"${t.theaterName}","${t.revenue}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'BaoCaoDoanhThu_Cinema.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
