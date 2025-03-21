import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone:false
})
export class AdminComponent implements OnInit, OnDestroy {
  pageTitle = 'Homepage';
  profileName = 'Admin User';
  userRole = '';
  userAction: string = '';
  userName='';
  private subscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.setupDynamicPageTitle();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadUserProfile(): void {
    this.subscription = this.authService.getUserProfile().subscribe({
      next: (user) => {
        if (user) { // Kiểm tra user có giá trị không
          this.userName = user.name || ''; // Kiểm tra thuộc tính profileName
          this.userRole = user.role || 'unknown'; // Đảm bảo userRole có giá trị mặc định
          this.userAction = user.action || 'unknown'; // Đảm bảo userAction có giá trị mặc định
        }
      },
      error: () => {
        this.userName = '';
        this.userRole = 'unknown';
        this.userAction = 'unknown';
      }
    });
  }

  private setupDynamicPageTitle(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {
        this.pageTitle = data['title'] || 'Admin Dashboard';
      });
  }

  canAccessFeature(): boolean {
    return this.userRole === 'admin';
  }

  confirmLogout(): void {
    if (confirm('Are you sure you want to log out?')) {
      this.logout();
    }
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