import React, { useState, useEffect } from "react";
import api from "../services/api"; // We will create this API service

function EventList({ userRegistrations, onRegister, onCancel }) {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({ date: "", location: "" });

  // Correctly fetch events when filters change
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.getEvents(filters);
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchEvents();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ date: "", location: "" });
  };

  const isUserRegistered = (eventId) => {
    return userRegistrations.some(reg => reg.event._id === eventId);
  };

  return (
    <section>
      <h2>Events</h2>
      <div className="filters">
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          className="form-input"
        />
        <input
          type="text"
          name="location"
          placeholder="Filter by location"
          value={filters.location}
          onChange={handleFilterChange}
          className="form-input"
        />
        <button onClick={clearFilters} className="btn btn-secondary">Clear</button>
      </div>

      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        events.map((ev) => (
          <div key={ev._id} className="card">
            <h3>{ev.title}</h3>
            <p>{ev.description}</p>
            <p><strong>Date:</strong> {ev.date} <strong>Time:</strong> {ev.time}</p>
            <p><strong>Location:</strong> {ev.location}</p>
            <p><strong>Capacity:</strong> {ev.registeredCount || 0} / {ev.capacity}</p>
            
            {isUserRegistered(ev._id) ? (
                 <p>✅ You are registered for this event.</p>
            ) : (
                 <button
                    onClick={() => onRegister(ev._id)}
                    disabled={ev.registeredCount >= ev.capacity}
                    className="btn btn-success"
                 >
                    {ev.registeredCount >= ev.capacity ? "Full" : "Register"}
                 </button>
            )}
          </div>
        ))
      )}
    </section>
  );
}

export default EventList;