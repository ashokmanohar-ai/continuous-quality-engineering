export type Product = {
  id: string;
  name: string;
  priceCents: number;
};

export type OrderItemInput = {
  productId: string;
  quantity: number;
};

export type OrderItem = OrderItemInput & {
  name: string;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type OrderStatus = 'CREATED' | 'PROCESSING' | 'DISPATCHED';

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  totalCents: number;
  status: OrderStatus;
  createdAt: string;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
};
