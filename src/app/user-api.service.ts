import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from './interface/User';

@Injectable({
  providedIn: 'root'
})
export class UserAPIService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private handleError(error: any): Observable<never> {
    return throwError(() => new Error(error.message || 'Server error'));
  }

  registerUser(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/signup`, user, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  loginUser(credentials: { email: string; password: string; rememberMe?: boolean }): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(
      `${this.apiUrl}/users/login`,
      credentials,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  logoutUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/logout`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  getUserDetails(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/profile`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  getUsers(page: number = 1, limit: number = 10, search: string = ''): Observable<{ users: User[]; total: number; pages: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{ users: User[]; total: number; pages: number }>(`${this.apiUrl}/users`, {
      headers: this.getHeaders(),
      params
    }).pipe(catchError(this.handleError));
  }

  updateUserProfile(userId: string, userData: Partial<User>): Observable<any> {
    if ('_id' in userData) delete userData._id;

    return this.http.patch<any>(`${this.apiUrl}/users/${userId}`, userData, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  deleteUserAccount(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${userId}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }
}
