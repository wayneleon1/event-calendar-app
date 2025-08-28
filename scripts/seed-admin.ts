import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

async function seedAdmin() {
  try {
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@example.com"))
      .limit(1);

    if (existingAdmin.length === 0) {
      const hashedPassword = await hash("admin123", 12);

      await db.insert(users).values({
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      });

      console.log("✅ Admin user created successfully");
    } else {
      console.log("ℹ️  Admin user already exists");
    }
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
