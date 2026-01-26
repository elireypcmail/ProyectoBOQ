import React, { useState } from "react";
import "../../../styles/admin/ProjectsAdmin.css"


const EditProjectModal = ({ project, onSave, onClose }) => {
  const [formData, setFormData] = useState(project);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString) => {
    // Si viene en formato dd/mm/yyyy lo convertimos
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    // Si ya está en formato yyyy-mm-dd lo dejamos igual
    return dateString;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h2 className="modal-name">Edit Project</h2>
          <p className="modal-subname">Modify project details</p>
        </header>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-gridProject">
            <div className="form-group full-width">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <option value="Interior Design">Interior Design</option>
                <option value="Architecture">Architecture</option>
                <option value="Commercial Design">Commercial Design</option>
                <option value="Landscaping">Landscaping</option>
                <option value="Renovation">Renovation</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="client">Client</label>
              <input
                id="client"
                value={formData.client}
                onChange={(e) => handleChange("client", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Ubication</label>
              <input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Start Date</label>
              <input
                id="date"
                type="date"
                value={formData.date}
                placeholder={formatDate(formData.date)}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration</label>
              <input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="budget">Budget</label>
              <input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[0-9.,]*$/.test(value)) {
                    handleChange("budget", value);
                  }
                }}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
