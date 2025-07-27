import React, { useState, useEffect } from "react";
import AuthForm from "./components/AuthForm";
import EventList from "./components/EventList";
// Import other components like MyRegistrations, EventForm when you create them
import api from "./services/api";
import "./App.css";

function App() {
  const [user, setUser] = useState(api.getUserFromToken());
  const [myRegistrations, setMyRegistrations] = useState([]);
  
  // Effect to run when user state changes (on login/logout)
  useEffect(() => {
    if (user) {
      fetchMyRegistrations();
    } else {
      setMyRegistrations([]);
    }
  }, [user]);

  const fetchMyRegistrations = async () => {
    try {
      const data = await api.getMyRegistrations();
      setMyRegistrations(data);
    } catch (error) {
      console.error("Failed to fetch registrations", error);
    }
  };

  const handleLogin = async (credentials) => {
    const { token } = await api.login(credentials);
    localStorage.setItem("token", token);
    setUser(api.getUserFromToken());
  };

  const handleRegister = async (userData) => {
    await api.register(userData);
    alert("Registration successful! Please log in."); // Can be replaced with a better notification
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };
  
  const handleRegisterForEvent = async (eventId) => {
    try {
        await api.registerForEvent(eventId);
        alert("Registered for event successfully!");
        fetchMyRegistrations(); // Refresh registrations
        // Note: EventList will re-fetch and update counts automatically
    } catch (error) {
        alert(`Registration failed: ${error.message}`);
    }
  };

  // Render Auth form if no user is logged in
  if (!user) {
    return <AuthForm onLogin={handleLogin} onRegister={handleRegister} />;
  }

  // Main application view for logged-in users
  return (
    <div className="container">
      <header className="app-header">
        <h1>Welcome, {user.name || user.email}!</h1>
        <button onClick={handleLogout} className="btn btn-danger">Logout</button>
      </header>

      <main>
        {/* You can add the EventForm for creating events here */}
        <EventList 
            userRegistrations={myRegistrations}
            onRegister={handleRegisterForEvent}
        />
        {/* You can add the MyRegistrations component here */}
      </main>
    </div>
  );
}

export default App;