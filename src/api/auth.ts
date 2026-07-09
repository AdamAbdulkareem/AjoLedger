import { apiRequest } from "./client";
import type { AuthData } from "../models/auth";
import { authDataSchema } from "../lib/schemas/apiSchemas";
import { validateApiPayload } from "../lib/validateApiResponse";

type EmailPasswordPayload = {
  email: string;
  password: string;
};

export async function registerUser(payload: EmailPasswordPayload) {
  const envelope = await apiRequest<AuthData>("/auth/register", {
    method: "POST",
    body: payload,
  });

  if (!envelope.data) {
    throw new Error("Registration returned no data.");
  }

  return {
    ...envelope,
    data: validateApiPayload(authDataSchema, envelope.data, "Registration failed."),
  };
}

export async function loginUser(payload: EmailPasswordPayload) {
  const envelope = await apiRequest<AuthData>("/auth/login", {
    method: "POST",
    body: payload,
  });

  if (!envelope.data) {
    throw new Error("Login returned no data.");
  }

  return {
    ...envelope,
    data: validateApiPayload(authDataSchema, envelope.data, "Login failed."),
  };
}
