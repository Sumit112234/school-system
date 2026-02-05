// API Response helpers
export function successResponse(data, message = "Success", status = 200) {
  return Response.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(message = "Error", status = 400, errors = null) {
  return Response.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}

// Validation helpers
export function validateRequired(fields, data) {
  const missing = [];
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === "string" && !data[field].trim())) {
      missing.push(field);
    }
  }
  return missing;
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  if (!password || password.length < 6) {
    return false;
  }
  return true;
}

// Pagination helper for MongoDB
export function getPaginationParams(searchParams) {
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

export function createPaginationResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Search and filter helpers for MongoDB
export function buildSearchQuery(searchTerm, fields) {
  if (!searchTerm) return {};
  
  const searchRegex = new RegExp(searchTerm, "i");
  return {
    $or: fields.map((field) => ({ [field]: searchRegex })),
  };
}

export function buildSortQuery(sortBy, sortOrder = "desc") {
  if (!sortBy) return { createdAt: -1 };
  return { [sortBy]: sortOrder === "asc" ? 1 : -1 };
}

// Date helpers
export function formatDate(date) {
  return new Date(date).toISOString().split("T")[0];
}

export function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

export function getStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Generate unique ID
export function generateId(prefix = "") {
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  return prefix ? `${prefix}-${id}` : id;
}

// Sanitize MongoDB query to prevent injection
export function sanitizeQuery(query) {
  if (typeof query !== "object" || query === null) return query;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith("$")) continue; // Skip operators at root
    sanitized[key] = value;
  }
  return sanitized;
}

// Handle MongoDB errors
export function handleMongoError(error) {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return errorResponse(`${field} already exists`, 409);
  }
  
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((e) => e.message);
    return errorResponse("Validation failed", 400, errors);
  }
  
  if (error.name === "CastError") {
    return errorResponse("Invalid ID format", 400);
  }
  
  console.error("Database error:", error);
  return errorResponse("Internal server error", 500);
}
