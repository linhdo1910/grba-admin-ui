import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.css'],
  standalone: false
})
export class MainpageComponent implements OnInit, OnDestroy {
  profileName: string = 'Admin';
  recentActivities = [
    { category: 'Chức năng', item: 'Sản phẩm', name: 'The Quinteen', action: 'edit' },
    { category: 'Chức năng', item: 'Giảm giá', name: 'ChristmasEVE', action: 'view' },
    { category: 'Chức năng', item: 'Sản phẩm', name: 'Kính mắt Ann...', action: 'edit' },
    { category: 'Chức năng', item: 'Sản phẩm', name: 'ChristmasEVE', action: 'view' },
    { category: 'Chức năng', item: 'Sản phẩm', name: 'ChristmasEVE', action: 'edit' },
    { category: 'Chức năng', item: 'Sản phẩm', name: 'ChristmasEVE', action: 'view' },
  ];
  private subscription: Subscription | null = null;
  private filterRecentActivities(): void {
    const action = this.authService.getAction() || 'just view';
    if (action !== 'edit all') {
      this.recentActivities = this.recentActivities.filter(
        activity => activity.action === action || activity.action === 'view'
      );
    }
  }

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.subscription = this.authService.getUserEmail().subscribe({
      next: (email) => {
        this.profileName = email || 'Admin';
      },
      error: () => {
        this.profileName = 'Admin';
      }
    });
    this.filterRecentActivities();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  navigateToHome(): void {
    window.open('/', '_blank');
  }
}
