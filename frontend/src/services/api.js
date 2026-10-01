
const BASE_URL = "http://localhost:5001/api";

export const apiRequest = async (
  endpoint,
  method = "GET",
  body = null
) => {
  const url = `${BASE_URL}${endpoint}`;

  console.log("API REQUEST URL:", url);

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(body !== null && {
      body: JSON.stringify(body),
    }),
  };

  try {
    const response = await fetch(url, config);
    const responseText = await response.text();

    console.log("API STATUS:", response.status);
    console.log("API RESPONSE:", responseText);

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Backend returned HTML or invalid JSON. URL: ${url}, Status: ${response.status}. Response: ${responseText.slice(0, 200)}`
      );
    }

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API ERROR:", error);
    throw error;
  }
};