import React, { useState, useEffect, useRef } from "react"
import { Heart } from "lucide-react"
// Styles
import "../../../styles/ui/ProjectCard.css"
import "../../../styles/ui/Modal.css"

const ProjectCard = ({ project, onEdit, onDelete, onUpdateImages, onToggleHighlight }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const dropdownRef = useRef(null)

  const toggleDropdown = () => setIsOpen(!isOpen)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed": return "badge badge-blue"
      case "In Progress": return "badge badge-yellow"
      case "Remodel": return "badge badge-gray"
      case "New Construction": return "badge badge-green"
      default: return "badge badge-gray"
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleDeleteClick = () => {
    setIsModalOpen(true)
    setIsOpen(false)
  }

  const confirmDelete = () => {
    onDelete(project.id)
    setIsModalOpen(false)
  }

  const cancelDelete = () => setIsModalOpen(false)

  // Extrae la imagen principal o la primera disponible usando base64
  const mainImage =
    project.images?.find(img => img.is_main)?.data
      ? `data:${project.images.find(img => img.is_main).mime_type};base64,${project.images.find(img => img.is_main).data}`
      : project.images?.[0]?.data
      ? `data:${project.images[0].mime_type};base64,${project.images[0].data}`
      : "/placeholder.svg"

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }


  return (
    <div className="cardAdmin">
      <div className="cardAdmin-image-wrapper">
        <img
          src={mainImage}
          alt={project.name}
          className="cardAdmin-image"
        />

        <button
          className={`icon-button favorite-btn ${project.favorite ? "is-favorite" : ""}`}
          onClick={() => onToggleHighlight(project.id)}
        >
          {project.favorite ? (
            <Heart size={18} fill="red" stroke="red" />
          ) : (
            <Heart size={18} stroke="gray" />
          )}
        </button>
      </div>

      <div className="cardAdmin-content">
        <div className="cardAdmin-header">
          <h3 className="cardAdmin-name">{project.name}</h3>

          <div className="dropdown" ref={dropdownRef}>
            <button className="icon-button" onClick={toggleDropdown}>⋮</button>
            {isOpen && (
              <div className="dropdown-menu">
                <button onClick={handleDeleteClick}>🗑️ Delete</button>
                <button onClick={() => onEdit(project)}>✏️ Edit</button>
                <button onClick={() => onUpdateImages(project.id)}>🖼️ Update Images</button>
              </div>
            )}
          </div>
        </div>

        <p className="cardAdmin-description">{project.description}</p>

        <div className="cardAdmin-info">
          <div className="info-item">👤 {project.client}</div>
          <div className="info-item">📍 {project.location}</div>
          <div className="info-item">📅 {formatDate(project.date)}</div>
          <div className="info-item">⏱ {project.duration}</div>
        </div>

        <div className="cardAdmin-footer">
          <div className="cardAdmin-budget">{formatCurrency(project.budget)}</div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal_confirm">
          <div className="modal_content">
            <h2>Are you sure you want to delete this project?</h2>
            <p className="modal_projectName">{project.name}</p>
            <div className="modal_actions">
              <button onClick={confirmDelete} className="btn_delete">Delete</button>
              <button onClick={cancelDelete} className="btn_cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectCard
