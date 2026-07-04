import { shouldUseLiveRegisterLogin } from "../config/api";
import { apiRequest } from "./client";
import { mockLogin, mockRegister } from "./mockAuth";
import type { AuthData } from "../models/auth";

type EmailPasswordPayload = {
  email: string;
  password: string;
};

export async function registerUser(payload: EmailPasswordPayload) {
  if (!shouldUseLiveRegisterLogin()) return mockRegister(payload);

  return apiRequest<AuthData>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function loginUser(payload: EmailPasswordPayload) {
  if (!shouldUseLiveRegisterLogin()) return mockLogin(payload);

  return apiRequest<AuthData>("/auth/login", {
    method: "POST",
    body: payload,
  });
}
