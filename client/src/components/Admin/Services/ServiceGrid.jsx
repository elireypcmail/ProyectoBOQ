import React, { useState } from "react"
import ServiceCard from "./ServiceCard"
import "../../../styles/ui/ProjectCard.css"

const ServiceGrid = ({
  services,
  onEditService,
  onUpdateImages,
  onDeleteService,
  onToggleFeatured
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const servicesPerPage = 9

  const indexOfLastService = currentPage * servicesPerPage
  const indexOfFirstService = indexOfLastService - servicesPerPage
  const currentServices = services.slice(indexOfFirstService, indexOfLastService)

  const totalPages = Math.ceil(services.length / servicesPerPage)

  return (
    <div>
      <div className="projectsAdmin-grid">
        {currentServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onEdit={() => onEditService(service)}
            onDelete={() => onDeleteService(service.id)}
            onUpdateImages={() => onUpdateImages(service)}
            onToggleFeatured={() => onToggleFeatured(service.id)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ServiceGrid
