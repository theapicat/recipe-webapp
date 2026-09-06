"use client";

export const agentInternal = {
  get: async (url: string) => {
    return await fetch(url, {
      method: "GET",
      mode: "same-origin",
      headers: { "Content-Type": "application/json" },
    });
  },
  post: async (url: string, body: object) => {
    return await fetch(url, {
      method: "POST",
      mode: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },
  put: async (url: string, body: object) => {
    return await fetch(url, {
      method: "PUT",
      mode: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },
  delete: async (url: string, body?: object) => {
    return await fetch(url, {
      method: "DELETE",
      mode: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },
};