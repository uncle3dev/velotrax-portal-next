// Global TypeScript types for VeloTrax Portal.
// Gateway response types are manually defined here until the Go OpenAPI spec
// is available and `pnpm generate:types` produces gateway.generated.ts.

export type SignInResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
};

export type SignUpResponse = {
  user: {
    id: string;
    email: string;
  };
};

export const GATEWAY_ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  IN_TRANSIT: "IN_TRANSIT",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type GatewayOrderStatus = (typeof GATEWAY_ORDER_STATUS)[keyof typeof GATEWAY_ORDER_STATUS];

export type GatewayOrderAddress = {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
};

export type GatewayOrder = {
  id: string;
  user_id: string;
  status: GatewayOrderStatus;
  tracking_number: string;
  origin_address: GatewayOrderAddress;
  destination_address: GatewayOrderAddress;
  estimated_delivery: string;
  weight_kg: number;
  created_at: string;
  updated_at: string;
};

export type OrdersResponse = {
  orders: GatewayOrder[];
  page: number;
  page_size: number;
  total: number;
};

export type OrderAddress = {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

export type OrderStatus = Lowercase<GatewayOrderStatus>;

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  trackingNumber: string;
  originAddress: OrderAddress;
  destinationAddress: OrderAddress;
  estimatedDelivery: string;
  weightKg: number;
  createdAt: string;
  updatedAt: string;
};

// Extended status for tracking view
export type TrackingStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type HubType = "hub" | "sorting_center" | "delivery_center" | "warehouse";

export interface TrackingEvent {
  id: string;
  status: TrackingStatus;
  description: string;
  location: string;
  timestamp: string;
  hubName?: string;
  hubType?: HubType;
}

export interface TrackingInfo {
  orderId: string;
  orderStatus: Order["status"] | "in_transit" | "out_for_delivery";
  estimatedDelivery?: string;
  events: TrackingEvent[];
}

export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  phone?: string;
  role?: string;
  roles?: string[];
  company?: string;
  title?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};
