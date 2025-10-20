import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
type ApiFetchOptions = Omit<
  AxiosRequestConfig,
  "url" | "method" | "data" | "headers"
> & {
  method?: AxiosRequestConfig["method"];
  headers?: Record<string, string>;
  body?: unknown;
};
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
export const apiFetch = async <T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<AxiosResponse<T>> => {
  const url = `${BASE_URL}${endpoint}`;
  const { method = "get", headers = {}, body, ...rest } = options;
  const resolvedHeaders: Record<string, string> = { ...headers };
  if (!(body instanceof FormData) && !resolvedHeaders["Content-Type"]) {
    resolvedHeaders["Content-Type"] = "application/json";
  }
  const config: AxiosRequestConfig = {
    url,
    method,
    headers: resolvedHeaders,
    data: body,
    ...rest,
  };
  try {
    const response = await axios<T>(config);
    return response;
  } catch (error) {
    console.error("Error de axios:", error);
    throw error;
  }
};
