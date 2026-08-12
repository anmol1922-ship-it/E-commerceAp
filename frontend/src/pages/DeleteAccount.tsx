import React, { useState } from "react";
import "./DeleteAccount.css";
import { useNavigate } from "react-router-dom";

const DeleteAccount: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("bisleri_token");
  const navigate = useNavigate();

  const handleDeleteRequest = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!email.trim()) {
      setMessage("Please enter your email.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/delete-account`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete your account.");
      }

      setMessage("Your account has been deleted successfully.");

      setEmail("");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-account-page">
      <div className="delete-account-container">
        <div className="delete-account-header">
          <div className="delete-icon">⚠</div>

          <h1>Delete Account</h1>

          <p>
            We're sorry to see you go. You can request deletion of your account
            and associated personal information using the form below.
          </p>
        </div>

        <div className="warning-box">
          <h2>Before you continue</h2>

          <p>
            Account deletion may permanently remove your account and associated
            data. This action may not be reversible.
          </p>

          <ul>
            <li>Your account information may be deleted.</li>
            <li>Your saved profile information may be removed.</li>
            <li>
              Your account history may be deleted where legally permitted.
            </li>
            <li>
              Some information may need to be retained where required by law or
              for legitimate business purposes.
            </li>
          </ul>
        </div>

        <form className="delete-account-form" onSubmit={handleDeleteRequest}>
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <button type="submit" className="delete-button" disabled={loading}>
            {loading ? "Processing..." : "Request Account Deletion"}
          </button>

          {message && (
            <div
              className={`delete-message ${
                message.toLowerCase().includes("success") ? "success" : "error"
              }`}
            >
              {message}
            </div>
          )}
        </form>

        <div className="delete-account-footer">
          <a href="/">Back to Home</a>

          <span>•</span>

          <a href="/privacy-policy">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;
