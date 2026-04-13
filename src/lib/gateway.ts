import { TRPCError } from "@trpc/server";
import { env } from "@/lib/env";
import { mockGatewayFetch } from "@/lib/mock-gateway";

export async function gatewayFetch<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  if (env.MOCK_GATEWAY === "true") {
    return mockGatewayFetch<T>(path, body);
  }

  const res = await fetch(`${env.GATEWAY_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
  }

  return res.json() as T;
}
