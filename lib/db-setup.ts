import { hash } from "bcrypt"
import prisma from "./prisma"

export async function setupDatabase() {
  try {
    // Check if we have any users
    const userCount = await prisma.user.count()

    // If no users exist, create an admin user
    if (userCount === 0) {
      const hashedPassword = await hash("admin123", 10)

      await prisma.user.create({
        data: {
          name: "Admin User",
          email: "admin@example.com",
          password: hashedPassword,
          isAdmin: true,
        },
      })

      console.log("Created admin user: admin@example.com / admin123")
      return { success: true, message: "Admin user created successfully" }
    }

    return { success: true, message: "Database already has users" }
  } catch (error) {
    console.error("Error setting up database:", error)
    return { success: false, error: String(error) }
  }
}

