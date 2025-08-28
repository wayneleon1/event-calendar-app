import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryFunction,
  UseQueryOptions,
} from "@tanstack/react-query";
import { Event, NewEvent } from "@/db/schema";
import { useAuth } from "@/contexts/AuthContext";

// Types for API responses
interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface EventsFilter {
  category?: string[];
  location?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  searchQuery?: string;
  createdBy?: number;
}

// Fetch events with filters
const fetchEvents: QueryFunction<Event[], ["events", EventsFilter]> = async ({
  queryKey,
}) => {
  const [_key, filters] = queryKey;
  const params = new URLSearchParams();

  if (filters?.category && filters.category.length > 0) {
    params.append("category", filters.category.join(","));
  }
  if (filters?.location && filters.location.length > 0) {
    params.append("location", filters.location.join(","));
  }
  if (filters?.dateRange?.start) {
    params.append("startDate", filters.dateRange.start.toISOString());
  }
  if (filters?.dateRange?.end) {
    params.append("endDate", filters.dateRange.end.toISOString());
  }
  if (filters?.searchQuery) {
    params.append("search", filters.searchQuery);
  }
  if (filters?.createdBy) {
    params.append("createdBy", filters.createdBy.toString());
  }

  const response = await fetch(`/api/events?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch events");
  }

  return response.json();
};

// Create a new event
const createEvent = async (eventData: NewEvent): Promise<Event> => {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create event");
  }

  return response.json();
};

// Update an existing event
const updateEvent = async (event: Event): Promise<Event> => {
  const response = await fetch(`/api/events/${event.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update event");
  }

  return response.json();
};

// Delete an event
const deleteEvent = async (eventId: number): Promise<void> => {
  const response = await fetch(`/api/events/${eventId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete event");
  }
};

// Hook for fetching events
export const useEvents = (
  filters: EventsFilter = {},
  options?: Omit<
    UseQueryOptions<Event[], Error, Event[], ["events", EventsFilter]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: fetchEvents,
    ...options,
  });
};

// Hook for creating events
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createEvent,
    onMutate: async (newEvent) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["events"] });

      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData<Event[]>(["events"]);

      // Optimistically add to the query
      queryClient.setQueryData<Event[]>(["events"], (old = []) => [
        ...old,
        {
          ...newEvent,
          id: Date.now(), // Temporary ID
          createdAt: new Date(),
          updatedAt: new Date(),
          currentAttendees: 0,
          createdBy: user?.id || 0,
        } as Event,
      ]);

      return { previousEvents };
    },
    onError: (err, newEvent, context) => {
      // Rollback on error
      queryClient.setQueryData(["events"], context?.previousEvents);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// Hook for updating events
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEvent,
    onMutate: async (updatedEvent) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["events"] });

      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData<Event[]>(["events"]);

      // Optimistically update to the new value
      queryClient.setQueryData<Event[]>(["events"], (old = []) =>
        old.map((event) =>
          event.id === updatedEvent.id
            ? { ...event, ...updatedEvent, updatedAt: new Date() }
            : event
        )
      );

      return { previousEvents };
    },
    onError: (err, updatedEvent, context) => {
      // Rollback on error
      queryClient.setQueryData(["events"], context?.previousEvents);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// Hook for deleting events
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onMutate: async (eventId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["events"] });

      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData<Event[]>(["events"]);

      // Optimistically remove from the query
      queryClient.setQueryData<Event[]>(["events"], (old = []) =>
        old.filter((event) => event.id !== eventId)
      );

      return { previousEvents };
    },
    onError: (err, eventId, context) => {
      // Rollback on error
      queryClient.setQueryData(["events"], context?.previousEvents);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// Hook for fetching a single event
export const useEvent = (eventId: number) => {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: async (): Promise<Event> => {
      const response = await fetch(`/api/events/${eventId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch event");
      }

      return response.json();
    },
    enabled: !!eventId,
  });
};

// Hook for fetching user's created events
export const useUserEvents = (userId: number) => {
  return useEvents({ createdBy: userId });
};

// Hook for fetching events by category
export const useEventsByCategory = (category: string) => {
  return useEvents({ category: [category] });
};

// Hook for fetching events by location
export const useEventsByLocation = (location: string) => {
  return useEvents({ location: [location] });
};

// Hook for searching events
export const useEventSearch = (searchQuery: string) => {
  return useEvents({ searchQuery });
};

// Hook for fetching upcoming events
export const useUpcomingEvents = (limit?: number) => {
  return useQuery({
    queryKey: ["events", "upcoming", limit],
    queryFn: async (): Promise<Event[]> => {
      const now = new Date().toISOString();
      const params = new URLSearchParams({ startDate: now });
      if (limit) params.append("limit", limit.toString());

      const response = await fetch(`/api/events?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch upcoming events");
      }

      return response.json();
    },
  });
};

// Hook for fetching popular events (most attendees)
export const usePopularEvents = (limit: number = 10) => {
  return useQuery({
    queryKey: ["events", "popular", limit],
    queryFn: async (): Promise<Event[]> => {
      const response = await fetch(`/api/events/popular?limit=${limit}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch popular events");
      }

      return response.json();
    },
  });
};
