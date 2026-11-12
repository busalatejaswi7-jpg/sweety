import api from "./api";
import type {
  Reading,
  ReadingPayload,
  ReadingsResponse,
  ReadingResponse,
} from "../types/reading.types";

export const fetchReadings = async (date: string): Promise<Reading[]> => {
  const response = await api.get<ReadingsResponse>("/readings", {
    params: { date },
  });

  return response.data.data.readings;
};

export const addReading = async (
  payload: ReadingPayload
): Promise<Reading> => {
  const response = await api.post<ReadingResponse>("/readings", payload);

  return response.data.data.reading;
};

export const removeReading = async (id: number): Promise<void> => {
  await api.delete(`/readings/${id}`);
};