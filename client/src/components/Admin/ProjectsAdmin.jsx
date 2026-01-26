import React, { useState, useEffect } from "react"
// Components
import ProjectHeader        from "./Projects/ProjectHeader"
import CreateProjectModal   from "./Projects/CreateProjectModal"
import ProjectGrid          from "./Projects/ProjectGrid"
import EditProjectModal     from "./Projects/EditProjectModal"
import UpdateImagesModal    from "./Projects/UpdateImagesModal"
// Context
import { useProject }       from "../../context/ProjectContext"
// Styles
import "../../styles/admin/ProjectsAdmin.css"

export default function ProjectManagement() {
  const { 
    projects, 
    getAllProjects, 
    createNewProject, 
    editedProject, 
    saveFilesProject, 
    deleteProject,
    toggleHighlightProject 
  } = useProject()

  const [filteredProjects, setFilteredProjects] = useState([])
  const [editingProject, setEditingProject] = useState(null)
  const [updatingImagesProject, setUpdatingImagesProject] = useState(null)
  const [isCreatingProject, setIsCreatingProject] = useState(false)

  // useEffect(() => {
  //   getAllProjects()
  // }, [])

  useEffect(() => {
    setFilteredProjects(projects)
  }, [projects])

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredProjects(projects)
      return
    }

    const filtered = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query.toLowerCase()) ||
        project.client.toLowerCase().includes(query.toLowerCase()) ||
        project.location.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredProjects(filtered)
  }

  const handleStatusFilter = (status) => {
    if (status === "All States") {
      setFilteredProjects(projects)
      return
    }
    setFilteredProjects(projects.filter((p) => p.status === status))
  }

  const handleCategoryFilter = (category) => {
    if (category === "All Categories") {
      setFilteredProjects(projects)
      return
    }
    setFilteredProjects(projects.filter((p) => p.category === category))
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
  }

  const handleUpdateImages = (project) => {
    setUpdatingImagesProject(project)
  }

  const handleSaveProject = async (id, updatedProject) => {
    const { files, images, ...projectWithoutFiles } = updatedProject

    await editedProject(id, projectWithoutFiles) // usamos la API + contexto
    setEditingProject(null)
  }

  const handleSaveImages = async (projectId, images) => {
    await saveFilesProject(projectId, images)
    setUpdatingImagesProject(null)
  }

  const handleNewProject = () => {
    setIsCreatingProject(true)
  }

  const handleCreateProject = async (newProject) => {
    const created = await createNewProject(newProject) // retorna { status, data }
    setIsCreatingProject(false)
    return created   // 👈 devuelve el proyecto al modal
  }

  const handleDeleteProject = async (id) => {
    await deleteProject(id) // elimina en backend y actualiza projects
  }

  const handleToggleHighlight = async (id) => {
    await toggleHighlightProject(id)
  }

  return (
    <div className="project-management">
      <div className="container_projectsAdmin">
        <ProjectHeader
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onCategoryFilter={handleCategoryFilter}
          onNewProject={handleNewProject}
        />

        <ProjectGrid
          projects={filteredProjects}
          onEditProject={handleEditProject}
          onUpdateImages={handleUpdateImages}
          onDeleteProject={handleDeleteProject}          // 👈 nuevo
          onToggleHighlight={handleToggleHighlight}      // 👈 nuevo
        />

        {/* Modal editar */}
        {editingProject && (
          <EditProjectModal
            project={editingProject}
            onSave={(updated) => handleSaveProject(editingProject.id, updated)}
            onClose={() => setEditingProject(null)}
          />
        )}

        {/* Modal actualizar imágenes */}
        {updatingImagesProject && (
          <UpdateImagesModal
            project={updatingImagesProject}
            onSave={handleSaveImages}
            onClose={() => setUpdatingImagesProject(null)}
          />
        )}

        {/* Modal crear proyecto */}
        {isCreatingProject && (
          <CreateProjectModal
            onSave={handleCreateProject}
            onClose={() => setIsCreatingProject(false)}
          />
        )}
      </div>
    </div>
  )
}
