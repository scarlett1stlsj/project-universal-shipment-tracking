
import { Package, Status, Carrier, Address, ShipmentDirection } from './types';

export const INITIAL_ADDRESSES: Address[] = [
  { id: '1', label: 'Home', street: '123 Tech Lane', city: 'San Francisco', state: 'CA', zip: '94105', isDefault: true },
  { id: '2', label: 'Office', street: '456 Innovation Way', city: 'Palo Alto', state: 'CA', zip: '94301', isDefault: false },
];

export const INITIAL_PACKAGES: Package[] = [
  {
    id: '1',
    name: 'Keychron K2 V2 Keyboard',
    carrier: Carrier.UPS,
    trackingNumber: '1Z999AA10123456784',
    status: Status.IN_TRANSIT,
    estimatedDelivery: '2024-05-24T14:00:00Z',
    lastUpdate: '2024-05-22T09:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=200&h=200&auto=format&fit=crop',
    productDescription: 'Mechanical keyboard with Gateron brown switches.',
    direction: ShipmentDirection.INCOMING,
    events: [
      { timestamp: '2024-05-22T09:30:00Z', location: 'Louisville, KY', description: 'Arrived at Facility', status: Status.IN_TRANSIT },
      { timestamp: '2024-05-21T18:00:00Z', location: 'Ontario, CA', description: 'Departed from Facility', status: Status.SHIPPED },
    ]
  },
  {
    id: '2',
    name: 'Herman Miller Embody',
    carrier: Carrier.AMAZON,
    trackingNumber: 'TBA3045987123',
    status: Status.OUT_FOR_DELIVERY,
    estimatedDelivery: '2024-05-22T18:00:00Z',
    lastUpdate: '2024-05-22T07:15:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=200&h=200&auto=format&fit=crop',
    productDescription: 'Black/Cyan rhythm fabric, graphite base.',
    direction: ShipmentDirection.INCOMING,
    events: [
      { timestamp: '2024-05-22T07:15:00Z', location: 'Local Hub', description: 'Out for delivery', status: Status.OUT_FOR_DELIVERY },
    ]
  },
  {
    id: '3',
    name: 'Monitor Return',
    carrier: Carrier.FEDEX,
    trackingNumber: '998877665544',
    status: Status.SHIPPED,
    estimatedDelivery: '2024-05-26T12:00:00Z',
    lastUpdate: '2024-05-23T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=200&h=200&auto=format&fit=crop',
    productDescription: 'Dell 27" 4K Monitor Return.',
    direction: ShipmentDirection.OUTGOING,
    isReturn: true,
    events: [
      { timestamp: '2024-05-23T10:00:00Z', location: 'FedEx Office', description: 'Package Dropped Off', status: Status.SHIPPED },
    ]
  },
  {
    id: '4',
    name: 'Standard Gift Box',
    carrier: Carrier.DHL,
    trackingNumber: 'DHL90210',
    status: Status.ORDER_PLACED,
    estimatedDelivery: '2024-05-28T12:00:00Z',
    lastUpdate: '2024-05-23T14:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1d8c9d9c6703?q=80&w=200&h=200&auto=format&fit=crop',
    productDescription: 'Handcrafted chocolate gift set.',
    direction: ShipmentDirection.OUTGOING,
    events: [
      { timestamp: '2024-05-23T14:00:00Z', location: 'Warehouse', description: 'Label Created', status: Status.ORDER_PLACED },
    ]
  }
];

export const STATUS_UI = {
  [Status.ORDER_PLACED]: { color: 'text-slate-500', bg: 'bg-slate-100', label: 'Placed' },
  [Status.SHIPPED]: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Shipped' },
  [Status.IN_TRANSIT]: { color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Moving' },
  [Status.OUT_FOR_DELIVERY]: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Near You' },
  [Status.DELIVERED]: { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Delivered' },
  [Status.EXCEPTION]: { color: 'text-rose-600', bg: 'bg-rose-50', label: 'Delayed' },
};

// Add color mappings for legacy PackageList component
export const STATUS_COLORS = {
  [Status.ORDER_PLACED]: 'bg-slate-100 text-slate-500',
  [Status.SHIPPED]: 'bg-blue-50 text-blue-600',
  [Status.IN_TRANSIT]: 'bg-indigo-50 text-indigo-600',
  [Status.OUT_FOR_DELIVERY]: 'bg-amber-50 text-amber-600',
  [Status.DELIVERED]: 'bg-emerald-50 text-emerald-600',
  [Status.EXCEPTION]: 'bg-rose-50 text-rose-600',
};

export const CARRIER_COLORS = {
  [Carrier.AMAZON]: 'border-amber-400',
  [Carrier.USPS]: 'border-blue-600',
  [Carrier.UPS]: 'border-amber-800',
  [Carrier.FEDEX]: 'border-purple-600',
  [Carrier.DHL]: 'border-yellow-400',
  [Carrier.OTHER]: 'border-slate-300',
};
