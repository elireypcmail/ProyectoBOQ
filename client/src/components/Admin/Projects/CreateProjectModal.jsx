import React, { useState } from "react"
import { IoIosCloseCircle } from "react-icons/io"
import { AiFillEye } from "react-icons/ai"
import { MdOutlineCloudUpload } from "react-icons/md"
import "../../../styles/ui/ModalCreateProject.css"
import { useProject } from "../../../context/ProjectContext"

export default function CreateProjectModalProject({ onSave, onClose }) {
  const { saveFilesProject } = useProject()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    status: "In Progress",
    client: "",
    location: "",
    date: "",
    duration: "",
    budget: "",
  })

  const [selectedFiles, setSelectedFiles] = useState([])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // ✅ Límite de 10 archivos
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)

    if (selectedFiles.length >= 10) {
      alert("You can only upload a maximum of 10 files")
      return
    }

    const remainingSlots = 10 - selectedFiles.length
    const limitedFiles = files.slice(0, remainingSlots)

    const newFiles = limitedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      mime_type: file.type,
      name: file.name,
      file,
      isLocal: true,
    }))

    setSelectedFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const moveFile = (fromIndex, toIndex) => {
    setSelectedFiles((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return updated
    })
  }

  const handleViewFile = (url) => {
    window.open(url, "_blank")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newProject = {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      client: formData.client,
      location: formData.location,
      date: formData.date,
      duration: formData.duration,
      budget: Number.parseInt(formData.budget) || 0,
      category: formData.category,
      favorite: false,
      files: []
    }

    const createdProject = await onSave(newProject)

    if (selectedFiles.length > 0 && createdProject?.data?.id) {
      const filesJson = selectedFiles.map((f, idx) => ({
        id: null,
        name: f.name,
        order: idx + 1,
      }))

      const localFiles = selectedFiles.map((f) => f.file)

      await saveFilesProject(createdProject.data.id, localFiles, filesJson)
    }

    onClose()
  }

  return (
    <div className="modalProject-overlay">
      <div className="modalProject-content">
        <h2 className="modalProject-name">Create New Project</h2>

        <form onSubmit={handleSubmit} className="form">
          {/* Campos básicos */}
          <div className="formModal-gridProject">
            <div className="formModal-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="formModal-group">
              <label htmlFor="client">Client</label>
              <input
                id="client"
                value={formData.client}
                onChange={(e) => handleInputChange("client", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="formModal-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="formModal-gridProject">
            <div className="formModal-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                required
              >
                <option value="">Select Category</option>
                <option value="Restoration & Heritages">Restoration & Heritages</option>
                <option value="Overlanding & Expedition">Overlanding & Expedition</option>
                <option value="Off-Road Performance">Off-Road Performance</option>
                <option value="Reliability & Maintenance">Reliability & Maintenance</option>
                <option value="Advanced Diagnostics">Advanced Diagnostics</option>
              </select>
            </div>

            <div className="formModal-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="formModal-gridProject">
            <div className="formModal-group">
              <label htmlFor="location">Ubication</label>
              <input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
              />
            </div>

            <div className="formModal-group">
              <label htmlFor="date">Start Date</label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="formModal-gridProject">
            <div className="formModal-group">
              <label htmlFor="duration">Duration</label>
              <input
                id="duration"
                placeholder="ej: 3 weeks, 2 months"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                required
              />
            </div>

            {/* ✅ Solo números, . o , */}
            <div className="formModal-group">
              <label htmlFor="budget">Budget</label>
              <input
                id="budget"
                type="text"
                placeholder="1000"
                value={formData.budget}
                onChange={(e) => {
                  const value = e.target.value
                  if (/^[0-9.,]*$/.test(value)) {
                    handleInputChange("budget", value)
                  }
                }}
                required
              />
            </div>
          </div>

          {/* Área de subida */}
          <div className="formModal-group">
            <label>Project Files</label>
            <p className="help-text">
              Select images or videos. The first file will be the cover.
            </p>

            <div
              className="uploadAdm-box"
              onClick={() => document.getElementById("fileUpload").click()}
            >
              <MdOutlineCloudUpload size={40} className="uploadAdm-icon" />
              <div className="text-center">
                <label htmlFor="fileUpload" className="upload-label">
                  Select Files
                  <input
                    id="fileUpload"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="upload-hint">PNG, JPG, MP4 up to 10MB</p>
            </div>

            {selectedFiles.length > 0 && (
              <ul className="files_containerEdit">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="file_itemEdit">
                    <div className="file_order">{index + 1}</div>

                    <div className="file_background">
                      {file.mime_type?.startsWith("video") ||
                      /\.(mp4|webm|ogg)$/i.test(file.name) ? (
                        <video
                          src={file.url}
                          controls
                          className="preview-file"
                        />
                      ) : (
                        <img
                          src={file.url || "/placeholder.svg"}
                          alt={`Archivo ${index + 1}`}
                          className="preview-file"
                        />
                      )}
                    </div>

                    <span className="file_name">{file.name}</span>
                    {index === 0 && (
                      <div className="badge_portada">Front Page</div>
                    )}

                    <IoIosCloseCircle
                      color="red"
                      size={28}
                      className="icon_closeimage"
                      onClick={() => removeFile(index)}
                    />

                    <div className="order_buttons">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveFile(index, index - 1)}
                        >
                          ⬅️
                        </button>
                      )}
                      <button type="button">
                        <AiFillEye
                          size={20}
                          className="icon_image"
                          onClick={() => handleViewFile(file.url)}
                        />
                      </button>
                      {index < selectedFiles.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveFile(index, index + 1)}
                        >
                          ➡️
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Botones */}
          <div className="formModal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-createProject">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
