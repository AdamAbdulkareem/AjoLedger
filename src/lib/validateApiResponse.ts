import { z } from "zod";

import { ApiError } from "../api/client";
import { assertValidGroupSummaries } from "./schemas/apiSchemas";

export function validateApiPayload<T>(
  schema: z.ZodType<T>,
  data: unknown,
  message = "Unexpected response from the server.",
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[api] Response validation failed:", result.error.flatten());
    }
    throw new ApiError(message);
  }

  return result.data;
}

export function validateGroupSummaries(groups: unknown[]): void {
  try {
    assertValidGroupSummaries(groups);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[api] Group list validation failed:", error);
    }
    throw new ApiError("Unexpected response from the server.");
  }
}
