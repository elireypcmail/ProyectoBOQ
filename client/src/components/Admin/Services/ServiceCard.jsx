import React, { useState, useEffect, useRef } from "react"
import { Heart } from "lucide-react"
// Styles
import "../../../styles/ui/projectCard.css"
import "../../../styles/ui/Modal.css"

const ServiceCard = ({
  service,
  onEdit,
  onDelete,
  onUpdateImages,
  onToggleFeatured
}) => {
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

  /* ================= STATUS BADGE ================= */
  const getStatusClass = (status) => {
    switch (status) {
      case "published":
        return "badge badge-green"
      case "draft":
        return "badge badge-gray"
      default:
        return "badge badge-gray"
    }
  }

  /* ================= PRICE FORMAT ================= */
  const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(amount)
  }

  /* ================= DELETE ================= */
  const handleDeleteClick = () => {
    setIsModalOpen(true)
    setIsOpen(false)
  }

  const confirmDelete = () => {
    onDelete(service.id)
    setIsModalOpen(false)
  }

  const cancelDelete = () => setIsModalOpen(false)

  /* ================= MAIN IMAGE ================= */
  const mainImage =
    service.images?.find(img => img.is_main)?.data
      ? `data:${service.images.find(img => img.is_main).mime_type};base64,${service.images.find(img => img.is_main).data}`
      : service.images?.[0]?.data
      ? `data:${service.images[0].mime_type};base64,${service.images[0].data}`
      : "/placeholder.svg"

  return (
    <div className="cardAdmin">
      {/* IMAGE */}
      <div className="cardAdmin-image-wrapper">
        <img
          src={mainImage}
          alt={service.name}
          className="cardAdmin-image"
        />

        <button
          className={`icon-button favorite-btn ${service.featured ? "is-favorite" : ""}`}
          onClick={() => onToggleFeatured(service.id)}
        >
          {service.featured ? (
            <Heart size={18} fill="red" stroke="red" />
          ) : (
            <Heart size={18} stroke="gray" />
          )}
        </button>
      </div>

      {/* CONTENT */}
      <div className="cardAdmin-content">
        <div className="cardAdmin-header">
          <h3 className="cardAdmin-name">{service.name}</h3>

          <div className="dropdown" ref={dropdownRef}>
            <button className="icon-button" onClick={toggleDropdown}>⋮</button>
            {isOpen && (
              <div className="dropdown-menu">
                <button onClick={handleDeleteClick}>🗑️ Delete</button>
                <button onClick={() => onEdit(service)}>✏️ Edit</button>
                <button onClick={() => onUpdateImages(service.id)}>🖼️ Update Images</button>
              </div>
            )}
          </div>
        </div>

        {/* STATUS */}
        <span className={getStatusClass(service.status)}>
          {service.status}
        </span>

        {/* DESCRIPTION */}
        <p className="cardAdmin-description">
          {service.short_description}
        </p>

        {/* INFO */}
        <div className="cardAdmin-info">
          {service.category && (
            <div className="info-item">🏷 {service.category}</div>
          )}
          {service.service_type && (
            <div className="info-item">🧩 {service.service_type}</div>
          )}
          {service.estimated_duration && (
            <div className="info-item">⏱ {service.estimated_duration}</div>
          )}
          {service.compatible_vehicles?.length > 0 && (
            <div className="info-item">
              🚗 Compatible con:{" "}
              {service.compatible_vehicles.map((v, i) => (
                <span key={i}>
                  {v.marca} {v.modelo} {v.anio} {v.version_trim}
                  {i < service.compatible_vehicles.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="cardAdmin-footer">
          {service.price != null && (
            <div className="cardAdmin-budget">
              {service.discount > 0
                ? formatCurrency(service.price * (1 - service.discount / 100))
                : formatCurrency(service.price)
              }
              {service.discount > 0 && (
                <span className="cardAdmin-discount"></span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {isModalOpen && (
        <div className="modal_confirm">
          <div className="modal_content">
            <h2>Are you sure you want to delete this service?</h2>
            <p className="modal_serviceName">{service.name}</p>
            <div className="modal_actions">
              <button onClick={confirmDelete} className="btn_delete">
                Delete
              </button>
              <button onClick={cancelDelete} className="btn_cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceCard
