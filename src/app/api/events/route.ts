import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, bookings } from "@/db/schema";
import { and, eq, gte, lte, inArray, like, or, sql } from "drizzle-orm";
import { authMiddleware } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const authResponse = authMiddleware(request);
    if (authResponse.status !== 200) {
      return authResponse;
    }
    const { searchParams } = new URL(request.url);

    // Build filters
    const filters = [];

    // Category filter
    const categories = searchParams.get("category")?.split(",");
    if (categories && categories.length > 0) {
      filters.push(inArray(events.category, categories));
    }

    // Location filter
    const locations = searchParams.get("location")?.split(",");
    if (locations && locations.length > 0) {
      filters.push(inArray(events.location, locations));
    }

    // Date range filter
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    if (startDate) {
      filters.push(gte(events.date, new Date(startDate)));
    }
    if (endDate) {
      filters.push(lte(events.date, new Date(endDate)));
    }

    // Search query
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      filters.push(
        or(
          like(events.title, `%${searchQuery}%`),
          like(events.description, `%${searchQuery}%`)
        )
      );
    }

    // Get events with attendee count
    const eventsData = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        date: events.date,
        endDate: events.endDate,
        category: events.category,
        location: events.location,
        maxAttendees: events.maxAttendees,
        createdBy: events.createdBy,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        currentAttendees: sql<number>`count(${bookings.id})`,
      })
      .from(events)
      .leftJoin(bookings, eq(events.id, bookings.eventId))
      .where(filters.length > 0 ? and(...filters) : undefined)
      .groupBy(events.id)
      .orderBy(events.date);

    return NextResponse.json(eventsData);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResponse = authMiddleware(request);
    if (authResponse.status !== 200) {
      return authResponse;
    }

    // Only admins can create events
    if (request.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const [newEvent] = await db.insert(events).values(body).returning();

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
