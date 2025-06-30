import { Component, OnInit } from '@angular/core';
import { OrderAPIService } from '../../order-api.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus } from '../../interface/Order';

interface StatusOption {
  value: OrderStatus;
  label: string;
  icon: string;
  iconClass: string;
}

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css'],
  standalone: false
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  filterOption: string = 'orderId'; // ✅ Thêm để fix lỗi [(ngModel)]
  searchQuery: string = '';
  statusFilter: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalOrders: number = 0;
  canEdit: boolean = false;
  isAdmin: boolean = false;

  statusOptions: StatusOption[] = [
    { value: 'preparing', label: 'Preparing', icon: 'fas fa-hourglass-half', iconClass: 'text-warning' },
    { value: 'shipping', label: 'Shipping', icon: 'fas fa-truck', iconClass: 'text-info' },
    { value: 'delivered', label: 'Delivered', icon: 'fas fa-check-circle', iconClass: 'text-success' },
    { value: 'cancelled', label: 'Cancelled', icon: 'fas fa-times-circle', iconClass: 'text-danger' }
  ];

  constructor(
    private orderService: OrderAPIService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getUserProfile().subscribe({
      next: (user) => {
        if (user) {
          this.isAdmin = user.role === 'admin';
          this.canEdit = this.isAdmin || user.action === 'sales ctrl' || user.action === 'edit all';
          if (this.isAdmin) {
            this.loadOrders();
          } else {
            console.warn('You do not have permission to view orders.');
          }
        }
      },
      error: () => {
        console.warn('Error loading user data.');
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalOrders / this.pageSize);
  }

  loadOrders(): void {
    this.orderService.getOrders(this.currentPage, this.pageSize, this.searchQuery, this.statusFilter).subscribe({
      next: (data) => {
        this.orders = data.orders;
        console.log('[DEBUG] Orders from backend:', this.orders);
        this.totalOrders = data.total;
      },
      error: (err) => {
        alert('An error occurred while loading the orders.');
        console.error('Error loading orders:', err);
      }
    });
  }

  updateOrderStatus(order: Order, newStatus: string): void {
    const validStatuses: OrderStatus[] = ['preparing', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus as OrderStatus)) {
      alert('Invalid status value.');
      return;
    }

    const status: OrderStatus = newStatus as OrderStatus;

    if (!this.isAdmin) {
      alert('You do not have permission to change the order status.');
      return;
    }

    if (!order.userId || !order.orderId) {
      alert('Missing order ID or user ID.');
      return;
    }

    if (!confirm(`Are you sure you want to update the status to "${status}"?`)) return;

    this.orderService.updateOrderStatus(order.userId, order.orderId, status).subscribe({
      next: () => {
        order.status = status;
        alert('Order status updated successfully.');
      },
      error: (err) => {
        alert('Failed to update order status.');
        console.error('Error updating order status:', err);
      }
    });
  }

  cancelOrder(order: Order): void {
    if (!this.isAdmin) {
      alert('You do not have permission to cancel orders.');
      return;
    }

    if (!order.userId || !order.orderId) {
      alert('Missing order ID or user ID.');
      return;
    }

    if (!confirm('Are you sure you want to cancel this order?')) return;

    this.orderService.cancelOrder(order.userId, order.orderId).subscribe({
      next: () => {
        alert('Order cancelled successfully.');
        this.loadOrders();
      },
      error: (err) => {
        alert('Failed to cancel the order.');
        console.error('Error cancelling order:', err);
      }
    });
  }

  downloadInvoice(order: Order): void {
    if (!order.userId || !order.orderId) {
      alert('Missing order ID or user ID.');
      return;
    }

    this.orderService.downloadInvoice(order.userId, order.orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${order.orderId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        alert('Failed to download the invoice.');
        console.error('Error downloading invoice:', err);
      }
    });
  }

  getStatusIcon(status: OrderStatus): string {
    return this.statusOptions.find(option => option.value === status)?.icon || '';
  }

  getStatusClass(status: OrderStatus): string {
    return this.statusOptions.find(option => option.value === status)?.iconClass || '';
  }

  getStatusLabel(status: OrderStatus): string {
    return this.statusOptions.find(option => option.value === status)?.label || status;
  }

  isPaid(order: Order): boolean {
    return order.payment_info.method !== 'COD' || order.status === 'delivered';
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  // ✅ Thêm hàm giả để tránh lỗi khi click Create Order
  createOrder(): void {
    alert('Create Order feature is not implemented yet.');
  }
}
