import { apiRequest } from "./client";
import type { AuthData } from "../models/auth";

type EmailPasswordPayload = {
  email: string;
  password: string;
};

export async function registerUser(payload: EmailPasswordPayload) {
  return apiRequest<AuthData>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function loginUser(payload: EmailPasswordPayload) {
  return apiRequest<AuthData>("/auth/login", {
    method: "POST",
    body: payload,
  });
}
