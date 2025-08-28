// src/types/index.ts
export interface Filters {
  category: string[];
  location: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  searchQuery: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  category: string;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: number;
  eventId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}
