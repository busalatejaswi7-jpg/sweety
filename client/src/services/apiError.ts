import axios from "axios";

interface ApiErrorResponse {
  message?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data?.message;
    if (message) return message;
    if (!error.response) {
      return "Cannot reach the server. Check your connection and try again.";
    }
  }

  return fallback;
}