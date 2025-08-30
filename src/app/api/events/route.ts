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
        createdBy: events.created_by,
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
        { error: "Admin access required to create events" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("Request body:", body);
    console.log("Request user:", request.user);

    // Validate required fields
    if (
      !body.title ||
      !body.description ||
      !body.date ||
      !body.category ||
      !body.location
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, description, date, category, and location are required",
        },
        { status: 400 }
      );
    }

    // Validate and convert dates
    let eventDate: Date;
    let endDate: Date | undefined;

    try {
      eventDate = new Date(body.date);
      if (isNaN(eventDate.getTime())) {
        throw new Error("Invalid date format");
      }

      if (body.end_date || body.endDate) {
        endDate = new Date(body.end_date || body.endDate);
        if (isNaN(endDate.getTime())) {
          throw new Error("Invalid end_date format");
        }
      }
    } catch (dateError) {
      return NextResponse.json(
        {
          error:
            "Invalid date format. Please use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
        },
        { status: 400 }
      );
    }

    // Prepare event data - use snake_case field names to match database schema
    const eventData = {
      title: body.title,
      description: body.description,
      date: eventDate,
      endDate: endDate, // Drizzle will map this to end_date
      category: body.category,
      location: body.location,
      maxAttendees: body.max_attendees || body.maxAttendees || 50, // Drizzle will map this to max_attendees
      created_by: body.created_by || request.user.id, // Use the created_by from body or fallback to request.user.id
    };

    console.log("Final event data for database:", eventData);

    // Validate that we have a valid user ID
    if (!eventData.created_by) {
      return NextResponse.json(
        { error: "User ID is required to create an event" },
        { status: 400 }
      );
    }

    try {
      const [newEvent] = await db.insert(events).values(eventData).returning();
      console.log("Successfully created event:", newEvent);
      return NextResponse.json(newEvent, { status: 201 });
    } catch (dbError) {
      console.error("Database error creating event:", dbError);
      return NextResponse.json(
        { error: "Database error: Failed to create event" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
