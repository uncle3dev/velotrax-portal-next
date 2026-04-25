import { TRPCError } from "@trpc/server";
import {
  type GatewayOrder,
  type SignInResponse,
  type SignUpResponse,
  type TrackingEvent,
  type UserProfile,
} from "@/types/index";

// Mock user database
const mockUsers = [
  {
    id: "user-1",
    email: "demo@velotrax.io",
    password: "password123",
    name: "Demo User",
    phone: "+84 901 234 567",
    role: "Customer",
    company: "Demo Logistics Co.",
    title: "Operations Lead",
    avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=Demo%20User",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-04-20T08:30:00Z",
  },
  {
    id: "user-2",
    email: "admin@velotrax.io",
    password: "password123",
    name: "Admin User",
    phone: "+84 902 345 678",
    role: "Admin",
    company: "VeloTrax",
    title: "Platform Admin",
    avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=Admin%20User",
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-04-21T10:15:00Z",
  },
];

// Mock orders
const mockOrders: GatewayOrder[] = [
  {
    id: "ORD-001",
    user_id: "user-1",
    status: "PENDING",
    tracking_number: "VTX-001",
    origin_address: {
      street: "1 Warehouse Ave",
      city: "Ho Chi Minh City",
      province: "Ho Chi Minh",
      postal_code: "700000",
      country: "VN",
    },
    destination_address: {
      street: "99 Customer St",
      city: "Da Nang",
      province: "Da Nang",
      postal_code: "550000",
      country: "VN",
    },
    estimated_delivery: "2024-04-12T10:30:00Z",
    weight_kg: 2.5,
    created_at: "2024-04-10T10:30:00Z",
    updated_at: "2024-04-10T12:00:00Z",
  },
  {
    id: "ORD-002",
    user_id: "user-2",
    status: "CONFIRMED",
    tracking_number: "VTX-002",
    origin_address: {
      street: "2 Warehouse Ave",
      city: "Ho Chi Minh City",
      province: "Ho Chi Minh",
      postal_code: "700000",
      country: "VN",
    },
    destination_address: {
      street: "88 Customer St",
      city: "Da Nang",
      province: "Da Nang",
      postal_code: "550000",
      country: "VN",
    },
    estimated_delivery: "2024-04-13T14:15:00Z",
    weight_kg: 1.2,
    created_at: "2024-04-09T14:15:00Z",
    updated_at: "2024-04-09T16:00:00Z",
  },
  {
    id: "ORD-003",
    user_id: "user-1",
    status: "DELIVERED",
    tracking_number: "VTX-003",
    origin_address: {
      street: "3 Warehouse Ave",
      city: "Ho Chi Minh City",
      province: "Ho Chi Minh",
      postal_code: "700000",
      country: "VN",
    },
    destination_address: {
      street: "77 Customer St",
      city: "Da Nang",
      province: "Da Nang",
      postal_code: "550000",
      country: "VN",
    },
    estimated_delivery: "2024-04-14T09:00:00Z",
    weight_kg: 3,
    created_at: "2024-04-08T09:00:00Z",
    updated_at: "2024-04-08T11:00:00Z",
  },
];

type SignInInput = { email: string; password: string };
type SignUpInput = { email: string; password: string };
type UserProfileInput = Record<string, never>;
type TrackingInput = { orderId: string };

type MockHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function getMockUserFromToken(token?: string) {
  const tokenUserId = token?.startsWith("mock-token-") ? token.replace("mock-token-", "") : undefined;
  return mockUsers.find((user) => user.id === tokenUserId) ?? mockUsers[0];
}

function toUserProfile(user: (typeof mockUsers)[number]): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    company: user.company,
    title: user.title,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function applyProfilePatch(user: (typeof mockUsers)[number], body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return user;
  }

  const patch = body as Record<string, unknown>;
  if (typeof patch.name === "string") user.name = patch.name;
  if (typeof patch.email === "string") user.email = patch.email;
  if (typeof patch.phone === "string") user.phone = patch.phone;
  if (typeof patch.role === "string") user.role = patch.role;
  if (typeof patch.company === "string") user.company = patch.company;
  if (typeof patch.title === "string") user.title = patch.title;
  if (typeof patch.avatarUrl === "string") user.avatarUrl = patch.avatarUrl;
  user.updatedAt = new Date().toISOString();

  return user;
}

export async function mockGatewayFetch<T>(
  path: string,
  body: unknown,
  token?: string,
  method: MockHttpMethod = "POST",
): Promise<T> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (path === "/auth/sign-in" || path === "/v1/auth/login") {
    const input = body as SignInInput;
    const user = mockUsers.find((u) => u.email === input.email && u.password === input.password);
    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
    }
    return {
      accessToken: `mock-token-${user.id}`,
      user: { id: user.id, email: user.email },
    } as T;
  }

  if (path === "/auth/register" || path === "/v1/auth/register") {
    const input = body as SignUpInput;
    const newId = `user-${Date.now()}`;
    return {
      user: { id: newId, email: input.email },
    } as T;
  }

  if (path === "/orders" || path === "/v1/orders") {
    return {
      orders: mockOrders,
      page: 1,
      page_size: mockOrders.length,
      total: mockOrders.length,
    } as T;
  }

  if (path === "/profile" || path === "/v1/profile" || path === "/v1/user/profile") {
    const user = getMockUserFromToken(token);

    if (method === "GET") {
      return toUserProfile(user) as T;
    }

    if (method === "PUT") {
      return toUserProfile(applyProfilePatch(user, body)) as T;
    }
  }

  if (path === "/tracking" || path === "/v1/tracking") {
    const input = body as TrackingInput;
    // Find mock order
    const order = mockOrders.find((o) => o.id === input.orderId);
    if (!order) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
    }

    // Generate mock tracking events based on order status
    const events: TrackingEvent[] = generateTrackingEvents(order);

    return {
      orderId: order.id,
      orderStatus: order.status.toLowerCase(),
      events,
    } as T;
  }

  throw new TRPCError({
    code: "NOT_FOUND",
    message: `Mock endpoint not found: ${path}`,
  });
}

function generateTrackingEvents(order: GatewayOrder): TrackingEvent[] {
  const baseDate = new Date(order.created_at);
  const baseHub = order.id.slice(-4); // Use last 4 chars of order ID as hub identifier

  const events: TrackingEvent[] = [];

  // Create 3 mock hubs based on order status
  const hubs = [
    { name: `Sorting Center ${baseHub}`, type: "sorting_center" as const, location: "Ho Chi Minh City" },
    { name: `Delivery Hub A-${baseHub}`, type: "delivery_center" as const, location: "Go Vap District" },
    { name: `Central Warehouse ${baseHub}`, type: "warehouse" as const, location: "Tan Phu District" },
  ];

  // Event 1: Order created / pending
  events.push({
    id: `evt-${order.id}-001`,
    status: "pending",
    description: "Order has been placed and is being processed",
    location: hubs[0].location,
    timestamp: baseDate.toISOString(),
    hubName: hubs[0].name,
    hubType: hubs[0].type,
  });

  // Always add processing event if order exists (for demo purposes)
  const processingDate = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
  events.push({
    id: `evt-${order.id}-002`,
    status: "processing",
    description: "Order is being prepared for shipment",
    location: hubs[0].location,
    timestamp: processingDate.toISOString(),
    hubName: hubs[0].name,
    hubType: hubs[0].type,
  });

  // Add shipped event for shipped/delivered orders
  const shippedDate = new Date(processingDate.getTime() + 24 * 60 * 60 * 1000);
  events.push({
    id: `evt-${order.id}-003`,
    status: "shipped",
    description: "Order has been shipped and is in transit",
    location: hubs[1].location,
    timestamp: shippedDate.toISOString(),
    hubName: hubs[1].name,
    hubType: hubs[1].type,
  });

  if (order.status === "DELIVERED") {
    // Event 4: Delivered
    const deliveredDate = new Date(shippedDate.getTime() + 48 * 60 * 60 * 1000);
    events.push({
      id: `evt-${order.id}-004`,
      status: "delivered",
      description: "Order has been successfully delivered",
      location: hubs[2].location,
      timestamp: deliveredDate.toISOString(),
      hubName: hubs[2].name,
      hubType: hubs[2].type,
    });
  }

  // Sort events by timestamp descending (most recent first)
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
