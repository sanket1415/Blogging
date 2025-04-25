// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface ApiError extends Error {
  status?: number;
}

export async function fetchAPI<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Set up headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers || {}) as Record<string, string>,
    };

    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    // Handle 204 No Content responses (common for DELETE requests)
    if (response.status === 204) {
      return null as unknown as T;
    }

    // Handle error responses
    if (!response.ok) {
      let errorData: { message?: string } = {};
      
      try {
        // Try to parse error JSON
        const text = await response.text();
        errorData = text ? JSON.parse(text) : {};
      } catch {
        // Fallback if JSON parsing fails
        errorData = { message: response.statusText };
      }

      const error: ApiError = new Error(
        errorData.message || `API request failed with status ${response.status}`
      );
      error.status = response.status;
      throw error;
    }

    // Check for empty response
    const contentLength = response.headers.get("Content-Length");
    if (contentLength === "0") {
      return null as unknown as T;
    }

    // Parse successful response
    try {
      return await response.json();
    } catch (error) {
      throw new Error("Failed to parse JSON response");
    }
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Cannot connect to server. Please check:\n1. Backend is running\n2. CORS is configured\n3. Correct API URL"
      );
    }
    
    throw error;
  }
}

// Mock API for development/preview
export async function mockAPI<T = any>(
  endpoint: string,
  mockData: T
): Promise<T> {
  console.warn(`Using mock data for: ${endpoint}`);
  
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData), 500);
  });
}

// Helper to determine if we should use mock data
export function shouldUseMockData(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_MOCK_API === "true" ||
    (typeof window !== "undefined" && !window.location.hostname.includes("localhost"))
  );
}

// Sample mock data
export const mockData = {
  user: {
    id: 1,
    name: "Demo User",
    email: "demo@example.com",
    bio: "This is a demo user account for testing purposes.",
    avatarUrl: "",
  },
  posts: [
    {
      id: 1,
      title: "Getting Started with React",
      content: "React is a popular JavaScript library for building user interfaces...",
      createdAt: "2023-05-15T10:30:00Z",
      likes: 24,
      comments: 8,
      author: {
        id: 1,
        name: "Demo User",
        avatarUrl: "",
      },
      userLiked: false,
    },
    // ... other mock posts
  ],
  comments: [
    // ... mock comments
  ],
};