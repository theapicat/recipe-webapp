import sessionManager from "@/lib/session/sessionManager";
import { fetchWithTimeout } from "@/lib/agent/fetchWithTimeout";

export const agentExternal = {
  get: async (url: string) => {
    const token = await sessionManager.getToken();
    return await fetchWithTimeout(url, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },
  post: async (url: string, body: object) => {
    const token = await sessionManager.getToken();
    return await fetchWithTimeout(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  },
  postForm: async (url: string, bodyParams: URLSearchParams) => {
    const token = await sessionManager.getToken();
    return await fetchWithTimeout(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: bodyParams.toString(),
    });
  },
  put: async (url: string, body: object) => {
    const token = await sessionManager.getToken();
    return await fetchWithTimeout(url, {
      method: "PUT",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  },
  delete: async (url: string, body?: object) => {
    const token = await sessionManager.getToken();
    return await fetchWithTimeout(url, {
      method: "DELETE",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  },
};
