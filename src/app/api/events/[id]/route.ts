import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, bookings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const eventId = parseInt(resolvedParams.id);

    const [eventData] = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        date: events.date,
        endDate: events.endDate,
        category: events.category,
        location: events.location,
        maxAttendees: events.maxAttendees,
        createdBy: events.created_by,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        currentAttendees: sql<number>`count(${bookings.id})`,
      })
      .from(events)
      .leftJoin(bookings, eq(events.id, bookings.eventId))
      .where(eq(events.id, eventId))
      .groupBy(events.id);

    if (!eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(eventData);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const eventId = parseInt(resolvedParams.id);
    const body = await request.json();

    const [updatedEvent] = await db
      .update(events)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(events.id, eventId))
      .returning();

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const eventId = parseInt(resolvedParams.id);

    await db.delete(bookings).where(eq(bookings.eventId, eventId));

    const [deletedEvent] = await db
      .delete(events)
      .where(eq(events.id, eventId))
      .returning();

    if (!deletedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
