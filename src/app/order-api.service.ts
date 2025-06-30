import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Order, OrderStatus, PaymentMethod } from './interface/Order';

@Injectable({
  providedIn: 'root'
})
export class OrderAPIService {
  private apiUrl = 'http://localhost:3000/api/orders';
  private productStockUrl = 'http://localhost:3000/api/products';
  private token: string | null = null;

  constructor(private http: HttpClient) {}

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private handleError(error: any): Observable<never> {
    const errorMessage =
      error?.error?.message ||
      (error.status === 413
        ? 'Payload quá lớn, vui lòng thử lại với dữ liệu nhỏ hơn.'
        : 'Đã xảy ra lỗi không xác định.');
    return throwError(() => new Error(errorMessage));
  }

  getOrders(page = 1, limit = 10, search = '', status = ''): Observable<{ orders: Order[]; total: number }> {
    const params: any = { page: page.toString(), limit: limit.toString() };
    if (search) params.search = search;
    if (status) params.status = status;

    return this.http
      .get<{ orders: Order[]; total: number }>(this.apiUrl, {
        headers: this.getHeaders(),
        params,
        withCredentials: true
      })
      .pipe(catchError(this.handleError));
  }

  placeOrder(orderData: {
    order_items: Record<string, {
      productName: string;
      price: number;
      quantity: number;
      imageUrl?: string;
    }>;
    payment_info: {
      method: PaymentMethod;
      status: 'unpaid' | 'paid';
      discount: number;
      shippingFee: number;
      total: number;
    };
    shipping_info: {
      name: string;
      phone: string;
      email: string;
      address: string;
    };
  }): Observable<{ orderId: string; message: string }> {
    return this.http
      .post<{ orderId: string; message: string }>(this.apiUrl, orderData, {
        headers: this.getHeaders(),
        withCredentials: true
      })
      .pipe(catchError(this.handleError));
  }

  updateOrderStatus(userId: string, orderId: string, status: OrderStatus): Observable<{ message: string }> {
    return this.http
      .patch<{ message: string }>(`${this.apiUrl}/${userId}/${orderId}/status`, { status }, {
        headers: this.getHeaders(),
        withCredentials: true
      })
      .pipe(catchError(this.handleError));
  }

  cancelOrder(userId: string, orderId: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/${userId}/${orderId}`, {
        headers: this.getHeaders(),
        withCredentials: true
      })
      .pipe(catchError(this.handleError));
  }

  getOrderHistory(userId: string): Observable<Order[]> {
    return this.http
      .get<Order[]>(`${this.apiUrl}/history/${userId}`, {
        headers: this.getHeaders(),
        withCredentials: true
      })
      .pipe(catchError(this.handleError));
  }

  updateProductStock(productId: string, quantity: number): Observable<any> {
    return this.http
      .patch<any>(`${this.productStockUrl}/${productId}/update-stock`, { quantity }, {
        headers: this.getHeaders(),
        withCredentials: true
      })
      .pipe(catchError(this.handleError));
  }

  downloadInvoice(userId: string, orderId: string): Observable<Blob> {
    return this.http
      .get(`${this.apiUrl}/${userId}/${orderId}/invoice`, {
        headers: this.getHeaders(),
        responseType: 'blob',
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }
}
