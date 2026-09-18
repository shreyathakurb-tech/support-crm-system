import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createTicket } from "../api/tickets";

function CreateTicket() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    subject: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (
      !formData.customer_name.trim() ||
      !formData.customer_email.trim() ||
      !formData.subject.trim() ||
      !formData.description.trim()
    ) {
      setError("Please fill all fields.");
      return;
    }

    if (formData.customer_name.trim().length < 2) {
      setError("Customer name must be at least 2 characters.");
      return;
    }

    if (formData.subject.trim().length < 3) {
      setError("Subject must be at least 3 characters.");
      return;
    }

    if (formData.description.trim().length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.customer_email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const newTicket = await createTicket({
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
      });

      navigate(`/tickets/${newTicket.ticket_id}`);
    } catch (err) {
      setError("Could not create ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Create Ticket</h1>
          <p>Add a new customer support issue.</p>
        </div>

        <Link className="secondary-button" to="/">
          Back
        </Link>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}

        <label>
          Customer Name
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            placeholder="Enter customer name"
            required
          />
        </label>

        <label>
          Customer Email
          <input
            type="email"
            name="customer_email"
            value={formData.customer_email}
            onChange={handleChange}
            placeholder="example@gmail.com"
            required
          />
        </label>

        <label>
          Subject
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief issue title"
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="6"
            placeholder="Describe the issue in detail..."
            required
          />
        </label>

        <button
          className="primary-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Ticket"}
        </button>
      </form>
    </div>
  );
}

export default CreateTicket;