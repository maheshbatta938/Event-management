import React, { useState } from "react";

function AuthForm({ onLogin, onRegister }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      if (isRegistering) {
        await onRegister({ name, email, password });
        setIsRegistering(false); // Switch to login view on success
      } else {
        await onLogin({ email, password });
      }
    } catch (err) {
      setError(err.message || "An error occurred.");
    }
  };

  return (
    <div className="auth-container">
      <h1>Event Management</h1>
      <h2>{isRegistering ? "Register" : "Login"}</h2>
      <form onSubmit={handleSubmit} className="form">
        {isRegistering && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="form-input"
        />
        <button type="submit" className={`btn ${isRegistering ? 'btn-success' : 'btn-primary'}`}>
          {isRegistering ? "Register" : "Login"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <p>
        {isRegistering ? "Already have an account?" : "Not registered?"}{" "}
        <button onClick={() => setIsRegistering(!isRegistering)} className="btn-link">
          {isRegistering ? "Login here" : "Register here"}
        </button>
      </p>
    </div>
  );
}

export default AuthForm;