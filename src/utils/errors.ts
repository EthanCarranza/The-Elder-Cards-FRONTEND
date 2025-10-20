import axios from "axios";
interface ErrorPayload {
  message?: string;
}
export const extractErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string") {
      return data;
    }
    if (data && typeof data === "object" && "message" in data) {
      const payload = data as ErrorPayload;
      if (payload.message) {
        return payload.message;
      }
    }
  } else if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};
