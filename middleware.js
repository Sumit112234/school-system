import { NextResponse } from "next/server"

const allowedOrigins = [
  "http://localhost:5173",
  "https://cgs-school-os-frontend.vercel.app"
]

export function middleware(req) {
  const origin = req.headers.get("origin")
  const res = NextResponse.next()

  if (allowedOrigins.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin)
  }

  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  )
  res.headers.set("Access-Control-Allow-Credentials", "true")

  
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { headers: res.headers })
  }

  return res
}