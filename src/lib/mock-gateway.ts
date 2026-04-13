import { TRPCError } from "@trpc/server";
import { type SignInResponse, type SignUpResponse, type Order, type UserProfile, type TrackingEvent } from "@/types/index";

// Mock user database
const mockUsers = [
  { id: "user-1", email: "demo@velotrax.io", password: "password123", name: "Demo User" },
  { id: "user-2", email: "admin@velotrax.io", password: "password123", name: "Admin User" },
];

// Mock orders
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "John Doe",
    status: "pending",
    totalAmount: 299.99,
    createdAt: "2024-04-10T10:30:00Z",
  },
  {
    id: "ORD-002",
    customerName: "Jane Smith",
    status: "processing",
    totalAmount: 149.99,
    createdAt: "2024-04-09T14:15:00Z",
  },
  {
    id: "ORD-003",
    customerName: "Bob Johnson",
    status: "shipped",
    totalAmount: 450.00,
    createdAt: "2024-04-08T09:00:00Z",
  },
  {
    id: "ORD-004",
    customerName: "Alice Williams",
    status: "delivered",
    totalAmount: 199.99,
    createdAt: "2024-04-07T16:45:00Z",
  },
  {
    id: "ORD-005",
    customerName: "Charlie Brown",
    status: "cancelled",
    totalAmount: 89.99,
    createdAt: "2024-04-06T11:20:00Z",
  },
  {
    id: "ORD-006",
    customerName: "Diana Prince",
    status: "pending",
    totalAmount: 599.99,
    createdAt: "2024-04-05T13:00:00Z",
  },
  {
    id: "ORD-007",
    customerName: "Eve Martinez",
    status: "shipped",
    totalAmount: 249.99,
    createdAt: "2024-04-04T08:30:00Z",
  },
  {
    id: "ORD-008",
    customerName: "Frank Thompson",
    status: "delivered",
    totalAmount: 379.99,
    createdAt: "2024-04-03T15:10:00Z",
  },
];

type SignInInput = { email: string; password: string };
type SignUpInput = { email: string; password: string };
type UserProfileInput = Record<string, never>;
type TrackingInput = { orderId: string };

export async function mockGatewayFetch<T>(path: string, body: unknown): Promise<T> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (path === "/auth/sign-in") {
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

  if (path === "/auth/register") {
    const input = body as SignUpInput;
    const newId = `user-${Date.now()}`;
    return {
      user: { id: newId, email: input.email },
    } as T;
  }

  if (path === "/orders") {
    return mockOrders as T;
  }

  if (path === "/user/profile") {
    // For mock, just return first user. In real implementation, would decode token to get user ID.
    const user = mockUsers[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: "2024-01-15T00:00:00Z",
    } as T;
  }

  if (path === "/tracking") {
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
      orderStatus: order.status,
      events,
    } as T;
  }

  throw new TRPCError({
    code: "NOT_FOUND",
    message: `Mock endpoint not found: ${path}`,
  });
}

// Generate mock tracking events for demonstration
function generateTrackingEvents(order: Order): TrackingEvent[] {
  const baseDate = new Date(order.createdAt);
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

  if (order.status === "delivered") {
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
