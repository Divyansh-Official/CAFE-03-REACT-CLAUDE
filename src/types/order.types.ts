export type OrderStatus = 'placed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type OrderType = 'dine_in' | 'pickup' | 'delivery';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface OrderItem {
  menuItemId: string;
  name: string;
  image: string;
  size?: string;
  addOns: string[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  orderType: OrderType;
  deliveryInfo?: DeliveryInfo;
  subtotal: number;
  gst: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  offerId?: string;
  couponCode?: string;
  estimatedDeliveryTime?: string;
  estimatedMinutes?: number;
  createdAt: string;
  updatedAt: string;
  placedAt?: string;
  preparingAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
}
