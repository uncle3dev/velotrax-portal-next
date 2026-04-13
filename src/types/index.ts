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

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};
