import { type TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

const errorMessages: Partial<Record<TRPC_ERROR_CODE_KEY, string>> = {
  UNAUTHORIZED: "Invalid email or password.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  CONFLICT: "An account with this email already exists.",
  BAD_REQUEST: "The request was invalid. Please check your input.",
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again later.",
  TOO_MANY_REQUESTS: "Too many attempts. Please wait a moment and try again.",
};

export function getErrorMessage(code: TRPC_ERROR_CODE_KEY): string {
  return errorMessages[code] ?? "An unexpected error occurred.";
}
