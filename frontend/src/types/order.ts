import type { CartItem } from "./cart";
export type Customer = {
  fullName: string;
  phone: string;
  email: string;
};

export type Delivery = {
  governorate: string;
  city: string;
  address: string;
};

export type Order = {
  id: string;
  customer: Customer;
  delivery: Delivery;
  items: CartItem[];
  total: number;
  status: string;
  createdAt: string;
};