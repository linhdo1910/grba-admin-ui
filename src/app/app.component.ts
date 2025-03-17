import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'my-app';
  isLoggedIn = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      
      // Nếu chưa đăng nhập, chuyển hướng đến trang login
      if (!this.isLoggedIn) {
        this.router.navigate(['/login']);
      }
    });
  }
}
