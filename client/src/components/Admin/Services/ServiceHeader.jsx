import React from "react"
import { Search, Plus, Grid, List } from "lucide-react"
import "../../../styles/admin/ProjectsAdmin.css"

const ProjectHeader = ({ onSearch, onStatusFilter, onCategoryFilter, onNewService }) => {
  return (
    <div className="projectAdmin-header">
      {/* Encabezado */}
      <div className="projectAdmin-header-top">
        <div>
          <h1 className="projectAdmin-header-title">Service Management</h1>
          <p className="projectAdmin-header-subtitle">
            Manage all your construction and remodeling projects
          </p>
        </div>
        <button className="btn btn-black" onClick={onNewService}>
          <Plus className="icon" />
          New Service
        </button>
      </div>

      {/* Barra de filtros */}
      <div className="projectAdmin-header-filters">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by name..."
            className="search-input-project"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <select className="select" onChange={(e) => onStatusFilter(e.target.value)}>
          <option value="All States">All States</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
        </select>

        <select className="select" onChange={(e) => onCategoryFilter(e.target.value)}>
          <option value="All Categories">All Categories</option>
          <option value="Interior Design">Interior Design</option>
          <option value="Architecture">Architecture</option>
          <option value="Commercial Design">Commercial Design</option>
          <option value="Landscaping">Landscaping</option>
          <option value="Renovation">Renovation</option>
        </select>
      </div>
    </div>
  )
}

export default ProjectHeader
