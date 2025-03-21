import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ResetPasswordResponse } from '../interface/User'

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: false
})
export class ResetPasswordComponent implements OnInit {
  password: string = '';
  confirmPassword: string = '';
  userId: string | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Lấy userId từ queryParams
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] || null;
      if (!this.userId) {
        this.errorMessage = 'Invalid reset link. Please try again.';
        setTimeout(() => {
          this.router.navigate(['/forgot-password']);
        }, 2000);
      }
    });
  }

  onSubmit(): void {
    if (!this.userId) {
      this.errorMessage = 'Invalid reset link.';
      return;
    }

    if (!this.password || !this.confirmPassword) {
      this.errorMessage = 'Please enter both password and confirmation.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.authService.resetPassword(this.userId, this.password).subscribe({
      next: (response: ResetPasswordResponse) => {
        if (response.success) {
          alert('Password reset successfully!');
          this.successMessage = response.message;
          this.errorMessage = null;
          console.log('Password reset successful:', response);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = response.message;
          this.successMessage = null;
        }
      },
      error: (error: any) => {
        console.error('Reset password failed:', error);
        this.errorMessage = error.message || 'An error occurred while resetting your password.';
        this.successMessage = null;
      }
    });
  }
}