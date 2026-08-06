import type { SharedReport, UserRecord, UserRole, UserStatus } from "../types";
import { requestJson, setAuthToken } from "./http";

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
  token?: string;
};

export function login(email: string, password: string) {
  return requestJson<LoginResult>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }).then((res) => {
    if (res && res.token) {
      setAuthToken(res.token);
    }
    return res;
  });
}

export function getUsers() {
  return requestJson<UserRecord[]>('/api/users');
}

export function createUser(input: CreateUserInput) {
  return requestJson<UserRecord>('/api/users', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export function deleteUser(id: string) {
  return requestJson<{ ok: true }>(`/api/users/${id}`, {
    method: 'DELETE'
  });
}

export function resolveGoogleMapsUrl(url: string) {
  return requestJson<{ resolvedUrl: string }>('/api/maps/resolve', {
    method: 'POST',
    body: JSON.stringify({ url })
  });
}

export type CompleteReportInput = {
  ownerCompany: string;
  customerEmail: string;
  buildingName: string;
  buildingAddress: string;
  templateCode: string;
  templateName: string;
  templatePages: number;
  inspectionDate: string;
  inspectorId?: string;
};

export function getReports() {
  return requestJson<SharedReport[]>('/api/reports');
}

export function completeReport(input: CompleteReportInput) {
  return requestJson<SharedReport>('/api/reports', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export type SendReportEmailInput = {
  recipientEmail: string;
  ccEmail?: string;
  fileName: string;
  pdfBase64: string;
};

export function sendReportEmail(reportId: string, input: SendReportEmailInput) {
  return requestJson<{ ok: true; recipientEmail: string; ccEmail?: string; sentAt: string }>(
    `/api/reports/${reportId}/email`,
    {
      method: 'POST',
      body: JSON.stringify(input)
    }
  );
}