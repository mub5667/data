/**
 * API request utility function
 */
export async function apiRequest(
  endpoint: string,
  method: string = "GET",
  data?: any
) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}