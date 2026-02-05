import { db } from "@/lib/data-store";
import { successResponse, errorResponse, paginate, searchFilter } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get tickets
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";
    const category = searchParams.get("category") || "";

    let tickets = db.tickets.findAll();

    // Regular users see only their tickets
    if (!["admin", "helper"].includes(session.role)) {
      tickets = db.tickets.findByUser(session.id);
    }

    // Helpers see tickets assigned to them or unassigned
    if (session.role === "helper") {
      tickets = tickets.filter((t) => t.assignedTo === session.id || !t.assignedTo);
    }

    // Filter by status
    if (status) {
      tickets = tickets.filter((t) => t.status === status);
    }

    // Filter by priority
    if (priority) {
      tickets = tickets.filter((t) => t.priority === priority);
    }

    // Filter by category
    if (category) {
      tickets = tickets.filter((t) => t.category === category);
    }

    // Search
    tickets = searchFilter(tickets, search, ["subject", "description"]);

    // Sort by update date descending
    tickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Add user and assignee info
    tickets = tickets.map((ticket) => {
      const user = db.users.findById(ticket.userId);
      const assignee = db.users.findById(ticket.assignedTo);
      return {
        ...ticket,
        userName: user?.name || "Unknown",
        userEmail: user?.email || "",
        userRole: user?.role || "unknown",
        assigneeName: assignee?.name || "Unassigned",
      };
    });

    const result = paginate(tickets, page, limit);

    // Add stats for helpers/admins
    if (["admin", "helper"].includes(session.role)) {
      const allTickets = db.tickets.findAll();
      result.stats = {
        total: allTickets.length,
        open: allTickets.filter((t) => t.status === "open").length,
        inProgress: allTickets.filter((t) => t.status === "in-progress").length,
        resolved: allTickets.filter((t) => t.status === "resolved").length,
        closed: allTickets.filter((t) => t.status === "closed").length,
      };
    }

    return successResponse(result);
  } catch (error) {
    console.error("Get tickets error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Create ticket
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { subject, description, category, priority } = body;

    if (!subject || !description) {
      return errorResponse("Subject and description are required", 400);
    }

    const ticket = db.tickets.create({
      userId: session.id,
      subject,
      description,
      category: category || "general",
      priority: priority || "medium",
      status: "open",
      assignedTo: null,
    });

    return successResponse(ticket, "Ticket created successfully", 201);
  } catch (error) {
    console.error("Create ticket error:", error);
    return errorResponse("Internal server error", 500);
  }
}
