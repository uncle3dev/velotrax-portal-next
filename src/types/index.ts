// Global TypeScript types for VeloTrax Portal.
// Gateway response types are manually defined here until the Go OpenAPI spec
// is available and `pnpm generate:types` produces gateway.generated.ts.

export type SignInResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
};

export type SignUpResponse = {
  user: {
    id: string;
    email: string;
  };
};

export type Order = {
  id: string;
  customerName: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  createdAt: string;
};

// Extended status for tracking view
export type TrackingStatus =
  | "pending"
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
  name: string;
  createdAt: string;
};
