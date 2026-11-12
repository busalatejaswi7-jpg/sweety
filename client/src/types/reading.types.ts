export type ReadingSlot =
  | "Morning fasting"
  | "After breakfast"
  | "After lunch"
  | "After dinner";

export interface Reading {
  id: number;
  reading_date: string;
  slot: ReadingSlot;
  value: number;
  created_at: string;
}

export interface ReadingPayload {
  readingDate: string;
  slot: ReadingSlot;
  value: number;
}

export interface ReadingsResponse {
  success: boolean;
  data: {
    readings: Reading[];
  };
}

export interface ReadingResponse {
  success: boolean;
  message: string;
  data: {
    reading: Reading;
  };
}