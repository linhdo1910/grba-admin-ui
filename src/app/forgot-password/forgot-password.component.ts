import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ForgotPasswordResponse } from '../interface/User';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  standalone: false
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null; // Thêm để hiển thị thông báo thành công

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    const { email } = this.forgotPasswordForm.value;
    this.authService.forgotPassword(email).subscribe({
      next: (response: ForgotPasswordResponse) => {
        if (response.success) {
          this.successMessage = response.message;
          this.errorMessage = null;
          console.log('Forgot password request successful:', response);
          setTimeout(() => {
            this.router.navigate(['/reset-password'], { 
              queryParams: { reset: 'sent', userId: response.userId || '' }
            });
          }, 2000); // Chuyển hướng sau 2 giây
        } else {
          this.errorMessage = response.message;
          this.successMessage = null;
        }
      },
      error: (error: any) => {
        console.error('Forgot password failed:', error);
        this.errorMessage = error.message || 'An error occurred while processing your request.';
        this.successMessage = null;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/login']);
  }
}