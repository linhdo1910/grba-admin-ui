import { Component, OnInit } from '@angular/core';
import { OrderAPIService } from '../../order-api.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus } from '../../interface/Order'; // Import từ file interface mới

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
  filterOption: string = '_id'; // Thay 'orderId' bằng '_id' để khớp với schema
  searchQuery: string = '';
  statusFilter: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalOrders: number = 0;
  canEdit: boolean = false;
  isAdmin: boolean = false;

  // Cập nhật statusOptions để khớp với OrderStatus từ schema
  statusOptions: StatusOption[] = [
    { value: 'Pending', label: 'Pending', icon: 'fas fa-hourglass-half', iconClass: 'text-warning' },
    { value: 'Processing', label: 'Processing', icon: 'fas fa-cogs', iconClass: 'text-info' },
    { value: 'Delivering', label: 'Delivering', icon: 'fas fa-truck', iconClass: 'text-primary' },
    { value: 'Finished', label: 'Finished', icon: 'fas fa-check-circle', iconClass: 'text-success' },
    { value: 'Cancelled', label: 'Cancelled', icon: 'fas fa-times-circle', iconClass: 'text-danger' }
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
        this.orders = data.orders.map((order: Order) => ({
          ...order,
          userName: order.userName || 'Anonymous',
          orderDate: new Date(order.orderDate), // Thay createdAt bằng orderDate
          createdAt: new Date(order.createdAt) // Giữ lại từ timestamps
        }));
        this.totalOrders = data.total;
      },
      error: (err) => {
        alert('An error occurred while loading the orders. Please try again.');
        console.error('Error loading orders:', err);
      }
    });
  }

  updateOrderStatus(order: Order, newStatus: string): void {
    const validStatuses: OrderStatus[] = ['Pending', 'Processing', 'Delivering', 'Finished', 'Cancelled'];
    if (!validStatuses.includes(newStatus as OrderStatus)) {
      alert('Invalid status value.');
      return;
    }

    const status: OrderStatus = newStatus as OrderStatus;

    if (!this.isAdmin) {
      alert('You do not have permission to change the order status.');
      return;
    }

    if (!order._id) {
      alert('Order ID is missing.');
      return;
    }

    if (!confirm(`Are you sure you want to update the status to ${newStatus}?`)) {
      return;
    }

    this.orderService.updateOrderStatus(order._id, status).subscribe({
      next: () => {
        order.status = status;
        alert('Order status updated successfully.');
      },
      error: (err) => {
        alert('Failed to update order status. Please try again.');
        console.error('Error updating order status:', err);
      }
    });
  }

  cancelOrder(orderId: string): void {
    if (!this.isAdmin) {
      alert('You do not have permission to cancel orders.');
      return;
    }

    if (!orderId) {
      alert('Order ID is missing.');
      return;
    }

    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        alert('Order cancelled successfully.');
        this.loadOrders();
      },
      error: (err) => {
        alert('Failed to cancel the order. Please try again.');
        console.error('Error cancelling order:', err);
      }
    });
  }

  downloadInvoice(orderId: string): void {
    if (!orderId) {
      alert('Order ID is missing.');
      return;
    }

    this.orderService.downloadInvoice(orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${orderId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        alert('Failed to download the invoice. Please try again.');
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

  createOrder(): void {
    console.log('Create order functionality to be implemented.');
  }

  isPaid(order: Order): boolean {
    return order.paymentMethod !== 'COD' || order.status === 'Finished'; // Thay 'cash_on_delivery' bằng 'COD' và 'completed' bằng 'Finished'
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
}