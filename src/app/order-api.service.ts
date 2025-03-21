import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Order, OrderStatus, PaymentMethod } from './interface/Order'; // Import interface mới

@Injectable({
  providedIn: 'root'
})
export class OrderAPIService {
  private apiUrl = 'http://localhost:3000/api/orders';
  private productStockUrl = 'http://localhost:3000/api/products';
  private token: string | null = null;

  constructor(private http: HttpClient) { }

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

  getOrders(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    status: string = ''
  ): Observable<{ orders: Order[]; total: number }> {
    const params: any = { page: page.toString(), limit: limit.toString() };
    if (search) params.search = search;
    if (status) params.status = status;

    return this.http
      .get<{ orders: Order[]; total: number }>(this.apiUrl, {
        headers: this.getHeaders(),
        params,
        withCredentials: true
      })
      .pipe(
        map(data => {
          data.orders.forEach(order => {
            order.userName = order.userName || 'Anonymous';
            order.orderDate = new Date(order.orderDate); // Chuyển đổi orderDate thành Date
            order.createdAt = new Date(order.createdAt); // Chuyển đổi createdAt thành Date
            order.updatedAt = new Date(order.updatedAt); // Chuyển đổi updatedAt thành Date
            order.transactionHistory.forEach(transaction => {
              transaction.timestamp = new Date(transaction.timestamp); // Chuyển đổi timestamp
            });
          });
          return data;
        }),
        catchError(this.handleError)
      );
  }

  placeOrder(orderData: {
    products: { productId: string; quantity: number; price: number; productName: string; productImage?: string }[];
    totalPrice: number;
    paymentMethod: PaymentMethod;
    shipTo: {
      fullName: string;
      city: string;
      district: string;
      ward: string;
      address: string;
      email: string;
      phone: string;
      note?: string;
    };
    shippingFee: number;
    subTotal: number;
    discountPrice: number;
    staffNote?: string;
  }): Observable<{ orderId: string; message: string }> {
    if (!Array.isArray(orderData.products) || orderData.products.length === 0) {
      return throwError(() => new Error('products must be a non-empty array.'));
    }
    for (const item of orderData.products) {
      if (
        !item.productId ||
        typeof item.quantity !== 'number' ||
        item.quantity <= 0 ||
        typeof item.price !== 'number' ||
        item.price < 0 ||
        !item.productName
      ) {
        return throwError(() => new Error('Invalid format in products.'));
      }
    }

    if (!orderData.totalPrice || typeof orderData.totalPrice !== 'number' || orderData.totalPrice <= 0) {
      return throwError(() => new Error('Invalid totalPrice.'));
    }

    if (!orderData.paymentMethod || !['COD', 'Banking', 'Momo', 'ZaloPay'].includes(orderData.paymentMethod)) {
      return throwError(() => new Error('Invalid paymentMethod.'));
    }

    const shipTo = orderData.shipTo;
    if (
      !shipTo.fullName ||
      !shipTo.city ||
      !shipTo.district ||
      !shipTo.ward ||
      !shipTo.address ||
      !shipTo.email ||
      !shipTo.phone ||
      typeof shipTo.fullName !== 'string' ||
      typeof shipTo.city !== 'string' ||
      typeof shipTo.district !== 'string' ||
      typeof shipTo.ward !== 'string' ||
      typeof shipTo.address !== 'string' ||
      typeof shipTo.email !== 'string' ||
      typeof shipTo.phone !== 'string'
    ) {
      return throwError(() => new Error('Invalid shipTo.'));
    }

    if (typeof orderData.shippingFee !== 'number' || orderData.shippingFee < 0) {
      return throwError(() => new Error('Invalid shippingFee.'));
    }

    if (typeof orderData.subTotal !== 'number' || orderData.subTotal < 0) {
      return throwError(() => new Error('Invalid subTotal.'));
    }

    if (typeof orderData.discountPrice !== 'number' || orderData.discountPrice < 0) {
      return throwError(() => new Error('Invalid discountPrice.'));
    }

    return this.http
      .post<{ orderId: string; message: string }>(this.apiUrl, orderData, {
        headers: this.getHeaders(),
        withCredentials: true
      })
      .pipe(catchError(this.handleError));
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<{ message: string }> {
    if (!orderId || typeof orderId !== 'string') {
      return throwError(() => new Error('Invalid orderId.'));
    }

    if (!status || !['Pending', 'Processing', 'Delivering', 'Finished', 'Cancelled'].includes(status)) {
      return throwError(() => new Error('Invalid status.'));
    }
    return this.http
      .patch<{ message: string }>(`${this.apiUrl}/${orderId}/status`, { status }, {
        headers: this.getHeaders(),
        withCredentials: true
      })
      .pipe(catchError(this.handleError));
  }

  cancelOrder(orderId: string): Observable<{ message: string }> {
    if (!orderId || typeof orderId !== 'string') {
      return throwError(() => new Error('Invalid orderId.'));
    }
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/${orderId}`, {
        headers: this.getHeaders(),
        withCredentials: true
      })
      .pipe(catchError(this.handleError));
  }

  getOrderHistory(userId: string): Observable<Order[]> {
    if (!userId || typeof userId !== 'string') {
      return throwError(() => new Error('Invalid userId.'));
    }
    return this.http
      .get<Order[]>(`${this.apiUrl}/history/${userId}`, {
        headers: this.getHeaders(),
        withCredentials: true
      })
      .pipe(
        map(orders => {
          return orders.map(order => ({
            ...order,
            orderDate: new Date(order.orderDate),
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt),
            transactionHistory: order.transactionHistory.map(transaction => ({
              ...transaction,
              timestamp: new Date(transaction.timestamp)
            }))
          }));
        }),
        catchError(this.handleError)
      );
  }

  updateProductStock(productId: string, quantity: number): Observable<any> {
    if (!productId || typeof productId !== 'string') {
      return throwError(() => new Error('Invalid productId.'));
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return throwError(() => new Error('quantity must be a positive number.'));
    }
    return this.http
      .patch<any>(`${this.productStockUrl}/${productId}/update-stock`, { quantity }, {
        headers: this.getHeaders(),
        withCredentials: true
      })
      .pipe(catchError(this.handleError));
  }

  downloadInvoice(orderId: string): Observable<Blob> {
    if (!orderId || typeof orderId !== 'string') {
      return throwError(() => new Error('Invalid orderId.'));
    }
    return this.http
      .get(`${this.apiUrl}/${orderId}/invoice`, {
        headers: this.getHeaders(),
        responseType: 'blob',
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }
}