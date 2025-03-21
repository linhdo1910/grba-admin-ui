import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable, throwError, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { LoginResponse, User, SignUpResponse, ForgotPasswordResponse,  ResetPasswordResponse } from '../interface/User';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000';
  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();
  private logoutEvent = new Subject<void>();
  logoutEvent$ = this.logoutEvent.asObservable();

  constructor(
    private http: HttpClient,
    private injector: Injector,
    private router: Router
  ) {
    this.initializeLoginStatus();
  }

  private initializeLoginStatus(): void {
    const token = this.getToken();
    if (token) {
      this.loggedIn.next(true);
      console.log('User is already logged in');
    } else {
      console.log('No valid session found. User must log in.');
      this.loggedIn.next(false);
    }
  }
  
  private storeSessionData(response: LoginResponse, rememberMe: boolean): void {
    if (!response || !response.userId) {
      console.warn('Invalid login response: Missing userId.');
      return;
    }
  
    if (!response.token) {
      console.warn('Warning: No token received. User might not be authenticated.');
      return;
    }
  
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('isLoggedIn', 'true');
    storage.setItem('userId', response.userId);
    storage.setItem('role', response.role);
    storage.setItem('action', response.action ?? 'just view');
    storage.setItem('token', response.token); // Chỉ lưu nếu có token
  
    console.log('Session data stored successfully');
  }
  
  private clearSessionData(): void {
    ['isLoggedIn', 'userId', 'profileName', 'role', 'action', 'token'].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }

  login(email: string, password: string, rememberMe: boolean): Observable<LoginResponse> {
    const body = { email, password };
    return this.http.post<LoginResponse>(`${this.baseUrl}/api/users/login`, body, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    }).pipe(
      tap(response => {
        console.log('Login API response:', response);
        if (!response || !response.userId || !response.token) {
          throw new Error('Invalid login response: Missing required fields');
        }
        this.storeSessionData(response, rememberMe);
        this.loggedIn.next(true);
        console.log('Logged in status updated to true');
        console.log('Role stored:', response.role);
        if (this.isAdmin()) {
          console.log('User is admin, navigating to /admin/mainpage');
          this.router.navigate(['/admin/mainpage']);
        } else {
          console.log('User is not admin, navigating to /user/mainpage');
          this.router.navigate(['/login']);
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => new Error(error?.error?.message || 'Login failed'));
      })
    );
  }
  //thêm vô
  signUp(name: string, email: string, password: string, phoneNumber?: string, address?: string, profilePicture?: string, role: 'user' | 'admin' = 'user'): Observable<SignUpResponse> {
    const body = { name, email, password, phoneNumber, address, profilePicture, role };
    return this.http.post<SignUpResponse>(`${this.baseUrl}/api/users/signup`, body, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    }).pipe(
      tap(response => {
        console.log('Sign-up API response:', response);
        if (!response || !response.userId) {
          throw new Error('Invalid sign-up response: Missing userId');
        }
      }),
      catchError((error) => {
        console.error('Sign-up error:', error);
        return throwError(() => new Error(error?.error?.message || 'Sign-up failed'));
      })
    );
  }


  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    const body = { email };
    return this.http.post<ForgotPasswordResponse>(`${this.baseUrl}/api/users/forgot-password`, body, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    }).pipe(
      tap(response => console.log('Forgot password API response:', response)),
      catchError(error => {
        console.error('Forgot password API error:', error);
        return throwError(() => new Error(error?.error?.message || 'Failed to send reset password request'));
      })
    );
  }
  logout(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/users/logout`, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    }).pipe(
      tap(() => {
        this.clearSessionData();
        this.loggedIn.next(false);
        this.logoutEvent.next();
      }),
      catchError((error) => {
        return throwError(() => new Error(error.error.message || 'Logout failed'));
      })
    );
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    console.log('Checking isLoggedIn. Token:', token, 'LoggedIn value:', this.loggedIn.value);
    return this.loggedIn.value && !!token; // Yêu cầu cả token và loggedIn
  }

  isAdmin(): boolean {
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    console.log('Checking isAdmin. Role:', role);
    return role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId') || sessionStorage.getItem('userId');
  }

  getUserProfile(): Observable<User | null> {
    const token = this.getToken();
    console.log('Fetching user profile with token:', token);
    return this.http.get<User>(`${this.baseUrl}/api/users/profile`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    }).pipe(
      tap(user => {
        console.log('User profile fetched:', user);
        localStorage.setItem("profileName", user.name);
        localStorage.setItem("action", user.action ?? 'just view');
      }),
      catchError((error) => {
        console.error('Error fetching user profile:', error);
        return throwError(() => new Error(error.error.message || 'Failed to get user profile'));
      })
    );
  }

  resetPassword(userId: string, password: string): Observable<ResetPasswordResponse> {
    const body = { userId, password };
    console.log('Sending reset password request:', body); // Debug
    return this.http.post<ResetPasswordResponse>(`${this.baseUrl}/api/users/reset-password`, body, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    }).pipe(
      tap(response => console.log('Reset password API response:', response)),
      catchError(error => {
        console.error('Reset password API error:', error);
        return throwError(() => new Error(error?.error?.message || 'Failed to reset password'));
      })
    );
  }

  getAction(): string | null {
    return localStorage.getItem('action') || sessionStorage.getItem('action');
  }
  
}