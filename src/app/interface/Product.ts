// product.interface.ts
export interface Product {
  _id?: string; // ID từ MongoDB, optional vì khi tạo mới không có
  productName: string;
  brandName?: string;
  productPrice: number;
  productDescription?: string;
  productStock: number;
  productCategory?: string;
  productSubCategory?: string;
  coverImage?: string;
  images?: string[]; // Mảng các chuỗi base64 hoặc URL
  color?: string;
  size?: string;
  materials?: string;
  sort?: string;
  note?: string;
  status: number;
  rating?: number;
  reviews?: number;
  discount?: number;
  previousPrice?: number;
  createdAt?: string; // Từ timestamps
  updatedAt?: string; // Từ timestamps
}