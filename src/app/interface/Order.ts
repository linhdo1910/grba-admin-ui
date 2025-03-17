import { Product } from './Product';

export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderResponse {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
}

// Nếu bạn cần dùng constructor, có thể tạo class riêng
export class OrderModel implements Order {
  constructor(
    public _id: string = "",
    public orderNumber: string = "",
    public customerName: string = "",
    public customerEmail: string = "",
    public customerPhone: string = "",
    public customerAddress: string = "",
    public items: OrderItem[] = [],
    public totalAmount: number = 0,
    public status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = "pending",
    public paymentStatus: 'pending' | 'paid' | 'failed' = "pending",
    public paymentMethod: string = "cash_on_delivery",
    public notes: string = "",
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) { }
}
