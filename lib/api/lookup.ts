import { apiClient } from "@/lib/api/client";

export interface LookupItem {
  uuid: string;
  name: string;
}

interface LookupResponse {
  success: boolean;
  message: string;
  data: LookupItem[];
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const cache: Record<string, { data: LookupItem[]; expiresAt: number }> = {};
const inflight: Record<string, Promise<LookupItem[]>> = {};

function cachedGet(key: string, path: string): Promise<LookupItem[]> {
  const cached = cache[key];
  if (cached && Date.now() < cached.expiresAt) {
    return Promise.resolve(cached.data);
  }

  if (key in inflight) {
    return inflight[key];
  }

  inflight[key] = apiClient
    .get<LookupResponse>(path)
    .then((response) => {
      cache[key] = { data: response.data.data, expiresAt: Date.now() + CACHE_TTL };
      return response.data.data;
    })
    .finally(() => {
      delete inflight[key];
    });

  return inflight[key];
}

export const lookupApi = {
  getDepartments: (): Promise<LookupItem[]> => cachedGet("departments", "/lookup/departments"),
  getOffices: (): Promise<LookupItem[]> => cachedGet("offices", "/lookup/offices"),
  getPositions: (): Promise<LookupItem[]> => cachedGet("positions", "/lookup/positions"),
  getRoles: (): Promise<LookupItem[]> => cachedGet("roles", "/lookup/roles"),
};
