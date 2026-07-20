import type { SharedReport, UserRecord, UserRole, UserStatus } from "../types";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "Request failed.");
  }

  return response.json() as Promise<T>;
}

export type CreateUserInput = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};

export type LoginResult = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

export function login(email: string, password: string) {
  return request<LoginResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function getUsers() {
  return request<UserRecord[]>("/api/users");
}

export function createUser(input: CreateUserInput) {
  return request<UserRecord>("/api/users", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function deleteUser(id: string) {
  return request<{ ok: true }>(`/api/users/${id}`, {
    method: "DELETE"
  });
}

export function resolveGoogleMapsUrl(url: string) {
  return request<{ resolvedUrl: string }>("/api/maps/resolve", {
    method: "POST",
    body: JSON.stringify({ url })
  });
}

export type CompleteReportInput = {
  ownerCompany: string;
  buildingName: string;
  buildingAddress: string;
  templateCode: string;
  templateName: string;
  templatePages: number;
  inspectionDate: string;
  inspectorId?: string;
};

export function getReports() {
  return request<SharedReport[]>("/api/reports");
}

export function completeReport(input: CompleteReportInput) {
  return request<SharedReport>("/api/reports", {
    method: "POST",
    body: JSON.stringify(input)
  });
}
