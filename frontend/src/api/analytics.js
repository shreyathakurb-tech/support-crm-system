const API_URL = "http://127.0.0.1:8000/api/analytics";

export async function getAnalyticsSummary() {
  const token = localStorage.getItem("resolvehub_token");

  const response = await fetch(
    `${API_URL}/summary`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to load analytics."
    );
  }

  return data;
}