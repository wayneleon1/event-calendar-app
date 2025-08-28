import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { hash } from "bcryptjs";

async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(users.email === "admin@example.com")
      .limit(1);

    if (existingAdmin.length === 0) {
      const hashedPassword = await hash("admin123", 12);

      await db.insert(users).values({
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      });

      console.log("Admin user created successfully");
      console.log("Email: admin@example.com");
      console.log("Password: admin123");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}

seedAdmin();
