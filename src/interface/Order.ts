import { Product } from './Product';

export interface Order {
  _id?: string | null;
  userId: string;
  userName?: string;
  items: {
    product: Product;
    quantity: number;
  }[];
  totalPrice: number;
  address: {
    street: string;
    province: string;
    district: string;
    ward: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  additionalNotes?: string;
  paymentMethod: string;
  createdAt: Date;
  status: string;
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
    public _id: string | null = null,
    public userId: string = "",
    public userName: string = "Anonymous",
    public items: {
      product: Product;
      quantity: number;
    }[] = [],
    public totalPrice: number = 0,
    public address: {
      street: string;
      province: string;
      district: string;
      ward: string;
    } = { street: "", province: "", district: "", ward: "" },
    public contact: {
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
    } = { firstName: "", lastName: "", phone: "", email: "" },
    public additionalNotes: string = "",
    public paymentMethod: string = "cash_on_delivery",
    public createdAt: Date = new Date(),
    public status: string = "pending"
  ) { }
}
