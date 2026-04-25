import { TRPCError } from "@trpc/server";
import { env } from "@/lib/env";
import { mockGatewayFetch } from "@/lib/mock-gateway";

export type GatewayMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type GatewayFetchOptions = {
  method?: GatewayMethod;
};

export async function gatewayFetch<T>(
  path: string,
  body?: unknown,
  token?: string,
  options?: GatewayFetchOptions,
): Promise<T> {
  const method = options?.method ?? "POST";

  if (env.MOCK_GATEWAY === "true") {
    return mockGatewayFetch<T>(path, body, token, method);
  }

  const hasBody = body !== undefined && method !== "GET";
  const res = await fetch(`${env.GATEWAY_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const message = await res.text();
    if (res.status === 404) {
      throw new TRPCError({ code: "NOT_FOUND", message });
    }

    if (res.status === 401) {
      throw new TRPCError({ code: "UNAUTHORIZED", message });
    }

    if (res.status === 403) {
      throw new TRPCError({ code: "FORBIDDEN", message });
    }

    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
  }

  return res.json() as T;
}
