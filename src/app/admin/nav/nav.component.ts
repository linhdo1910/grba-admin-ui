import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  standalone:false,
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  isSidebarOpen: boolean = false;
  isAdmin: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']).then(() => {
          window.location.reload();
        });
      },
      error: (error) => {
        console.error('Logout failed:', error);
        this.router.navigate(['/login']).then(() => {
          window.location.reload();
        });
      }
    });
  }
}