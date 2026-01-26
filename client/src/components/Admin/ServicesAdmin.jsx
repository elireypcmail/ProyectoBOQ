import React, { useState, useEffect } from "react"
// Components
import ServiceHeader           from "./Services/ServiceHeader"
import CreateServiceModal      from "./Services/CreateServiceModal"
import ServiceGrid             from "./Services/ServiceGrid"
import EditServiceModal        from "./Services/EditServiceModal"
import UpdateServiceImagesModal from "./Services/UpdateImagesModal"
// Context
import { useService }          from "../../context/ServiceContext"
// Styles
import "../../styles/admin/ProjectsAdmin.css"

export default function ServiceManagement() {
  const { 
    services, 
    getAllServices, 
    createNewService, 
    editedService, 
    saveFilesService, 
    deleteService,
    toggleFeaturedService 
  } = useService()

  const [filteredServices, setFilteredServices] = useState([])
  const [editingService, setEditingService] = useState(null)
  const [updatingImagesService, setUpdatingImagesService] = useState(null)
  const [isCreatingService, setIsCreatingService] = useState(false)

  useEffect(() => {
    getAllServices()
  }, [])

  useEffect(() => {
    setFilteredServices(services)
  }, [services])

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredServices(services)
      return
    }

    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(query.toLowerCase()) ||
        service.category?.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredServices(filtered)
  }

  const handleStatusFilter = (status) => {
    if (status === "All States") {
      setFilteredServices(services)
      return
    }
    setFilteredServices(services.filter((s) => s.status === status))
  }

  const handleCategoryFilter = (category) => {
    if (category === "All Categories") {
      setFilteredServices(services)
      return
    }
    setFilteredServices(services.filter((s) => s.category === category))
  }

  const handleEditService = (service) => {
    setEditingService(service)
  }

  const handleUpdateImages = (service) => {
    setUpdatingImagesService(service)
  }

  const handleSaveService = async (id, updatedService) => {
    const { files, images, ...serviceWithoutFiles } = updatedService
    await editedService(id, serviceWithoutFiles)
    setEditingService(null)
  }

  const handleSaveImages = async (serviceId, images) => {
    await saveFilesService(serviceId, images)
    setUpdatingImagesService(null)
  }

  const handleNewService = () => {
    setIsCreatingService(true)
  }

  const handleCreateService = async (newService) => {
    const created = await createNewService(newService)
    setIsCreatingService(false)
    return created
  }

  const handleDeleteService = async (id) => {
    await deleteService(id)
  }

  const handleToggleFeatured = async (id) => {
    await toggleFeaturedService(id)
  }

  return (
    <div className="project-management">
      <div className="container_projectsAdmin">
        <ServiceHeader
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onCategoryFilter={handleCategoryFilter}
          onNewService={handleNewService}
        />

        <ServiceGrid
          services={filteredServices}
          onEditService={handleEditService}
          onUpdateImages={handleUpdateImages}
          onDeleteService={handleDeleteService}
          onToggleFeatured={handleToggleFeatured}
        />

        {/* Modal editar */}
        {editingService && (
          <EditServiceModal
            service={editingService}
            onSave={(updated) => handleSaveService(editingService.id, updated)}
            onClose={() => setEditingService(null)}
          />
        )}

        {/* Modal actualizar imágenes */}
        {updatingImagesService && (
          <UpdateServiceImagesModal
            service={updatingImagesService}
            onSave={handleSaveImages}
            onClose={() => setUpdatingImagesService(null)}
          />
        )}

        {/* Modal crear servicio */}
        {isCreatingService && (
          <CreateServiceModal
            onSave={handleCreateService}
            onClose={() => setIsCreatingService(false)}
          />
        )}
      </div>
    </div>
  )
}
