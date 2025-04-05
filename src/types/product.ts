export interface Product {
  _id: string;
  image1: string;
  image2?: string;
  image3?: string;
  image4?: string;
  productName: string;
  description: string;
  productType: string;
  category?: string;
  price: number;
  salePrice?: number;
  sku?: string;
  stockQuantity: number;
  sales?: number;
  remaining?: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}
