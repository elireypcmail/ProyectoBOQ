import React, { useEffect, useMemo } from 'react'
import {
  Home,
  TrendingUp,
  MapPin,
  Hammer,
  PaintBucket,
  Building,
  Trees,
} from "lucide-react"
// Context
import { useProject } from "../../context/ProjectContext"
// Styles
import "../../styles/admin/dashboard.css"

const Dashboard = () => {
  const { projects, getAllProjects } = useProject()

  useEffect(() => {
    getAllProjects()
  }, [])

  // Helpers para normalizar
  const normalizeStatus = (status) => (status || "").toLowerCase().trim()
  const normalizeCategory = (cat) => (cat || "other").toLowerCase().trim()

  // ---- Dynamic Stats ----
  const projectStats = useMemo(() => {
    const totalProjects = projects.length

    const activeProjects = projects.filter(
      p => normalizeStatus(p.status) === "in progress"
    ).length

    const completedProjects = projects.filter(
      p => normalizeStatus(p.status) === "completed"
    ).length

    const totalBudget = projects.reduce(
      (sum, p) => sum + (Number(p.budget) || 0),
      0
    )

    const avgProjectValue =
      totalProjects > 0 ? Math.round(totalBudget / totalProjects) : 0

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget,
      avgProjectValue
    }
  }, [projects])

  // ---- Categorías base ----
  const baseCategories = [
    { name: "Interior Design", key: "interior design", color: "blue" },
    { name: "Renovation", key: "renovation", color: "green" },
    { name: "Architecture", key: "architecture", color: "purple" },
    { name: "Commercial Design", key: "commercial design", color: "orange" },
    { name: "Landscaping", key: "landscaping", color: "teal" },
    { name: "Other", key: "other", color: "gray" },
  ]

  const categoryStats = useMemo(() => {
    return baseCategories.map(cat => {
      const count = projects.filter(
        p => normalizeCategory(p.category) === cat.key.toLowerCase()
      ).length
      return { ...cat, count }
    })
  }, [projects])

  const getStatusClass = (status) => {
    switch (normalizeStatus(status)) {
      case "completed":
        return "admin-badge admin-badge-green"
      case "in progress":
        return "admin-badge admin-badge-blue"
      case "planning":
        return "admin-badge admin-badge-yellow"
      default:
        return "admin-badge admin-badge-gray"
    }
  }

  const getCategoryIcon = (category) => {
    switch (normalizeCategory(category)) {
      case "interior design":
        return <PaintBucket size={16} />
      case "renovation":
        return <Hammer size={16} />
      case "architecture":
      case "commercial":
      case "commercial design":
        return <Building size={16} />
      case "landscaping":
        return <Trees size={16} />
      default:
        return <Home size={16} />
    }
  }

  return (
    <main className="admin-main">
      {/* Header */}
      <header className="admin-header">
        <div>
          <h1>Welcome! 👋</h1>
          <p>Here's what's happening with your projects today</p>
        </div>
      </header>

      <section className="admin-content">
        {/* Stats */}
        <div className="admin-stats-grid">
          <div className="admin-card admin-dark">
            <div>
              <p>Total Budget</p>
              <h2>${projectStats.totalBudget.toLocaleString()}</h2>
            </div>
            <span>{projectStats.totalProjects} projects</span>
          </div>
          <div className="admin-card">
            <div>
              <p>Active Projects</p>
              <h2>{projectStats.activeProjects}</h2>
            </div>
          </div>
          <div className="admin-card">
            <div>
              <p>Complete Projects</p>
              <h2>{projectStats.completedProjects}</h2>
            </div>
          </div>
        </div>

        <div className="admin-grid-2">
          {/* Recent Projects */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Recent Projects</h3>
            </div>
            <div>
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="admin-project-item">
                  <div className="admin-project-info">
                    <div className="admin-avatar-sm">
                      {getCategoryIcon(project.category)}
                    </div>
                    <div>
                      <p className="admin-project-name">{project.name}</p>
                      <p className="admin-project-client">{project.client}</p>
                      <div className="admin-location">
                        <MapPin size={12} /> {project.location}
                      </div>
                    </div>
                  </div>
                  <div className="admin-project-meta">
                    <span className={getStatusClass(project.status)}>
                      {project.status}
                    </span>
                    <p>${project.budget?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Statistics</h3>
            </div>
            <div className="admin-stats-circle">
              <div>
                <h2>${projectStats.avgProjectValue.toLocaleString()}</h2>
                <p>Avg Value</p>
              </div>
            </div>
            <div className="admin-categories">
              {categoryStats.map((c, i) => (
                <div key={i} className="admin-category-item">
                  <span className={`admin-dot admin-${c.color}`}></span>
                  <span>{c.name}</span>
                  <span className="admin-count">{c.count}</span>
                  <TrendingUp size={12} className="admin-trend" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Dashboard
