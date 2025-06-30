// product.interface.ts
export interface Product {
  product_id?: string; // ID sản phẩm trong Realtime DB
  product_name: string;
  product_stock: number;
  category_id?: string;
  product_price: number;
  product_description?: string;
  product_instruction?: string;
  product_images?: {
    [key: string]: string; // image1, image2, image3,...
  };
  product_rating?: string; // VD: "5/5"
  product_discount?: number;
  product_reviews?: {
    [key: string]: string; // review1, review2,...
  };
  product_level?: string; // VD: "Medium"
  water_demand?: string;
  conditions?: string;
}
