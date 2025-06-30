export type OrderStatus = 'preparing' | 'shipping' | 'delivered' | 'cancelled';
export type PaymentMethod = 'COD' | 'Banking';

export interface OrderItem {
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  imageResId?: string;
}

export interface ShippingInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  status: 'unpaid' | 'paid';
  discount: number;
  shippingFee: number;
  total: number;
}

export interface Order {
  orderId: string;
  userId: string;
  userName: string;
  createdAt: number; // Timestamp (number) từ Firebase
  status: OrderStatus;
  totalAmount: number;

  order_items: {
    [productId: string]: OrderItem;
  };

  shipping_info: ShippingInfo;
  payment_info: PaymentInfo;

  staffNote?: string;
}

export interface OrderResponse {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
}
