import { API_BASE_URL } from "../config/api";
import type { ApiEnvelope } from "../models/auth";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, token }: RequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Unable to reach the server. Check your connection.");
  }

  let payload: ApiEnvelope<T>;

  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError("Unexpected response from the server.", response.status);
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(
      payload.message || "Something went wrong. Please try again.",
      response.status,
    );
  }

  return payload;
}
