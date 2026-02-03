
export enum Carrier {
  AMAZON = 'Amazon',
  USPS = 'USPS',
  UPS = 'UPS',
  FEDEX = 'FedEx',
  DHL = 'DHL',
  OTHER = 'Other'
}

export enum Status {
  ORDER_PLACED = 'Order Placed',
  SHIPPED = 'Shipped',
  IN_TRANSIT = 'In Transit',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERED = 'Delivered',
  EXCEPTION = 'Exception'
}

export enum ShipmentDirection {
  INCOMING = 'Incoming',
  OUTGOING = 'Outgoing'
}

export interface TrackingEvent {
  timestamp: string;
  location: string;
  description: string;
  status: Status;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

export interface Package {
  id: string;
  name: string;
  carrier: Carrier;
  trackingNumber: string;
  status: Status;
  estimatedDelivery: string;
  lastUpdate: string;
  events: TrackingEvent[];
  imageUrl?: string;
  productDescription?: string;
  isReturn?: boolean;
  direction: ShipmentDirection;
}

export type ViewType = 'home' | 'create' | 'profile';
