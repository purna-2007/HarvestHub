
const API_BASE_URL = "http://localhost:5000";

// Common API request function
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
};

// Farmer / Worker Login
export const loginUser = async (userData) => {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

// Farmer / Worker Registration
export const registerUser = async (userData) => {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

// Get current user profile
export const getUserProfile = async (token) => {
  return apiRequest("/api/auth/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};