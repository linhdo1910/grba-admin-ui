// order.interface.ts
import { Product } from './Product'; // Giả sử bạn vẫn giữ interface Product

// Định nghĩa OrderStatus dựa trên schema backend
export type OrderStatus = 'Pending' | 'Processing' | 'Delivering' | 'Finished' | 'Cancelled';

// Định nghĩa PaymentMethod dựa trên schema backend
export type PaymentMethod = 'COD' | 'Banking' | 'Momo' | 'ZaloPay';

export interface OrderProduct {
  productId: string; // ObjectId từ MongoDB, trả về dạng string
  productName: string;
  productImage?: string; // Từ schema mới
  price: number;
  quantity: number;
  subtotal?: number; // Giữ từ interface cũ nếu bạn muốn tính ở frontend
}

export interface ShipTo {
  fullName: string;
  city: string;
  district: string;
  ward: string;
  address: string;
  email: string;
  phone: string;
  note?: string;
}

export interface Transaction {
  action: 'CREATE_ORDER' | 'UPDATE_STATUS' | 'UPDATE_SHIPPING' | 'CANCEL_ORDER';
  timestamp: Date;
  details: object; // Có thể định nghĩa chi tiết hơn nếu backend trả về cấu trúc cụ thể
  status: OrderStatus;
}

export interface Order {
  _id: string; // Từ schema mới (MongoDB ObjectId)
  userId?: string; // Từ schema mới, optional
  userName: string;
  products: OrderProduct[]; // Thay 'items' bằng 'products' để đồng bộ schema
  shipTo: ShipTo; // Thay thế customerEmail, customerPhone, customerAddress
  shippingFee: number; // Từ schema mới
  subTotal: number; // Từ schema mới
  discountPrice: number; // Từ schema mới
  totalPrice: number; // Có trong cả hai
  orderDate: Date; // Từ schema mới
  paymentMethod: PaymentMethod; // Giới hạn giá trị theo schema mới
  status: OrderStatus; // Đồng bộ với schema mới
  staffNote?: string; // Từ schema mới
  transactionHistory: Transaction[]; // Từ schema mới
  createdAt: Date; // Từ timestamps
  updatedAt: Date; // Từ timestamps
}

export interface OrderResponse {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
}

// Class OrderModel (nếu bạn vẫn muốn giữ)
export class OrderModel implements Order {
  constructor(
    public _id: string = '',
    public userId: string | undefined = undefined,
    public userName: string = '',
    public products: OrderProduct[] = [],
    public shipTo: ShipTo = {
      fullName: '',
      city: '',
      district: '',
      ward: '',
      address: '',
      email: '',
      phone: '',
      note: ''
    },
    public shippingFee: number = 0,
    public subTotal: number = 0,
    public discountPrice: number = 0,
    public totalPrice: number = 0,
    public orderDate: Date = new Date(),
    public paymentMethod: PaymentMethod = 'COD',
    public status: OrderStatus = 'Pending',
    public staffNote: string = '',
    public transactionHistory: Transaction[] = [],
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}