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

const REQUEST_TIMEOUT_MS = 15_000;

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new ApiError("Request timed out. Please try again.");
    }
    throw new ApiError("Unable to reach the server. Check your connection.");
  } finally {
    clearTimeout(timeoutId);
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
