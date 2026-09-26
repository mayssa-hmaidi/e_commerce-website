export type ProductVariant = {
  color: string;
  images: string[];
};

export type Product = {
  _id: string;
  name: string;
  price: number;
  discount: number;
  description: string;
  variants: ProductVariant[];
  sizes: string[];
  stock: number;
};