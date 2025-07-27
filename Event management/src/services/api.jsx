import { jwtDecode } from "jwt-decode"; // Use a robust library: `npm install jwt-decode`

const API_BASE = "http://localhost:5000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (endpoint, options = {}) => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "API request failed");
  }
  return data;
};

const api = {
  login: (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (userData) => request("/auth/register", { method: "POST", body: JSON.stringify(userData) }),

  getEvents: (filters) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/events?${params}`);
  },
  createEvent: (eventData) => request("/events", { method: "POST", body: JSON.stringify(eventData) }),
  
  getMyRegistrations: () => request("/registrations/me"),
  registerForEvent: (eventId) => request("/registrations", { method: "POST", body: JSON.stringify({ eventId }) }),
  cancelRegistration: (regId) => request(`/registrations/${regId}`, { method: "DELETE" }),
  
  // Safe JWT decoding
  getUserFromToken: () => {
    try {
      const token = localStorage.getItem("token");
      return token ? jwtDecode(token) : null;
    } catch (error) {
      return null;
    }
  },
};

export default api;