const BASE_URL = "http://localhost:3000/api";

export const apiRequest = async (endpoint, method = "GET", body = null) => {
  const headers = { "Content-Type": "application/json" };
  const config = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    return await response.json();
  } catch (err) {
    console.error(`🚨 Fetch operation failure on path: ${endpoint}`, err);
    throw err;
  }
};
