"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function SetupPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Setting up your database...")

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        const response = await fetch("/api/setup")
        const data = await response.json()

        if (data.success) {
          setStatus("success")
          setMessage(data.message)
        } else {
          setStatus("error")
          setMessage(data.error || "An error occurred during setup")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Failed to connect to the setup API")
        console.error(error)
      }
    }

    setupDatabase()
  }, [])

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === "loading" ? "Setting Up..." : status === "success" ? "Setup Complete" : "Setup Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading"
              ? "Please wait while we set up your application"
              : status === "success"
                ? "Your Football Game Manager application has been set up successfully"
                : "There was a problem setting up your application"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {status === "loading" ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
              </div>
            ) : status === "success" ? (
              <>
                <p>{message}</p>
                <p>An admin user has been created with the following credentials:</p>
                <div className="bg-muted p-3 rounded-md">
                  <p>
                    <strong>Email:</strong> admin@example.com
                  </p>
                  <p>
                    <strong>Password:</strong> admin123
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please change these credentials after your first login for security reasons.
                </p>
              </>
            ) : (
              <p className="text-red-500">{message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          {status !== "loading" && (
            <Button asChild className="w-full">
              <Link href="/">{status === "success" ? "Go to Login" : "Try Again Later"}</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

