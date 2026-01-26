import React, { useState } from "react"
import ProjectCard from "./ProjectCard"
import "../../../styles/ui/ProjectCard.css"

const ProjectGrid = ({ projects, onEditProject, onUpdateImages, onDeleteProject, onToggleHighlight }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const projectsPerPage = 9

  const indexOfLastProject = currentPage * projectsPerPage
  const indexOfFirstProject = indexOfLastProject - projectsPerPage
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject)

  const totalPages = Math.ceil(projects.length / projectsPerPage)

  return (
    <div>
      <div className="projectsAdmin-grid">
        {currentProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={() => onEditProject(project)}
            onDelete={() => onDeleteProject(project.id)}
            onUpdateImages={() => onUpdateImages(project)}
            onToggleHighlight={() => onToggleHighlight(project.id)}
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
            Page {currentPage} de {totalPages}
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

export default ProjectGrid
