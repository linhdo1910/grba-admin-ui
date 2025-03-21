import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.css'],
  standalone:false
})
export class MainpageComponent implements OnInit, OnDestroy {
  profileName: string = 'Admin';
  recentActivities = [
    { category: 'Features', item: 'Products', name: 'Sofa Japan', action: 'edit' },
    { category: 'Features', item: 'Blogs', name: 'Blog Details', action: 'view' },
    { category: 'Features', item: 'Homepage', name: 'The Kanso...', action: 'edit' },
    { category: 'Features', item: 'Policies', name: 'Polices', action: 'view' },
    { category: 'Features', item: 'Products', name: 'Customize', action: 'edit' },
    { category: 'Features', item: 'Contact', name: 'Contact', action: 'view' }
  ];
  private subscription: Subscription | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.subscription = this.authService.getUserProfile().subscribe({
      next: (user) => {
        if (user) {
          this.profileName = user.name ??  'Admin';
        }
      },
      error: () => {
        this.profileName = 'Admin';
      }
    });
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