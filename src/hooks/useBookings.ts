/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface BookingResponse {
  id: number;
  eventId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  event?: any;
}

export const useBookEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<BookingResponse, Error, number>({
    mutationFn: async (eventId) => {
      if (!user) throw new Error("User not authenticated");

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, userId: user.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to book event");
      }

      return response.json();
    },
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ queryKey: ["events"] });
      await queryClient.cancelQueries({ queryKey: ["bookings", user?.id] });

      const previousEvents = queryClient.getQueryData<any[]>(["events"]) || [];
      const previousBookings =
        queryClient.getQueryData<BookingResponse[]>(["bookings", user?.id]) ||
        [];

      // Optimistically update events
      queryClient.setQueryData(["events"], (old: any[] = []) =>
        old.map((event) =>
          event.id === eventId
            ? { ...event, currentAttendees: (event.currentAttendees || 0) + 1 }
            : event
        )
      );

      // Optimistically add booking
      const newBooking: BookingResponse = {
        id: Date.now(), // temporary ID
        eventId,
        userId: user!.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        event: previousEvents.find((e) => e.id === eventId),
      };

      queryClient.setQueryData(
        ["bookings", user?.id],
        (old: BookingResponse[] = []) => [...old, newBooking]
      );

      return { previousEvents, previousBookings };
    },
    onError: (err, eventId, context: any) => {
      queryClient.setQueryData(["events"], context?.previousEvents);
      queryClient.setQueryData(
        ["bookings", user?.id],
        context?.previousBookings
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", user?.id] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<void, Error, number>({
    mutationFn: async (bookingId) => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to cancel booking");
    },
    onMutate: async (bookingId) => {
      await queryClient.cancelQueries({ queryKey: ["events"] });
      await queryClient.cancelQueries({ queryKey: ["bookings", user?.id] });

      const previousEvents = queryClient.getQueryData<any[]>(["events"]) || [];
      const previousBookings =
        queryClient.getQueryData<BookingResponse[]>(["bookings", user?.id]) ||
        [];

      const bookingToRemove = previousBookings.find((b) => b.id === bookingId);

      if (bookingToRemove) {
        queryClient.setQueryData(["events"], (old: any[] = []) =>
          old.map((event) =>
            event.id === bookingToRemove.eventId
              ? {
                  ...event,
                  currentAttendees: (event.currentAttendees || 1) - 1,
                }
              : event
          )
        );
      }

      queryClient.setQueryData(
        ["bookings", user?.id],
        (old: BookingResponse[] = []) => old.filter((b) => b.id !== bookingId)
      );

      return { previousEvents, previousBookings, bookingToRemove };
    },
    onError: (err, bookingId, context: any) => {
      queryClient.setQueryData(["events"], context?.previousEvents);
      queryClient.setQueryData(
        ["bookings", user?.id],
        context?.previousBookings
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", user?.id] });
    },
  });
};
