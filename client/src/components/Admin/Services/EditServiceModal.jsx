import React, { useState } from "react";
import { 
  IoClose, 
  IoCarSportOutline, 
  IoPricetagOutline, 
  IoImageOutline, 
  IoConstructOutline, 
  IoDocumentTextOutline 
} from "react-icons/io5";
import { MdOutlineCloudUpload } from "react-icons/md";
import "../../../styles/ui/ModalCreateService.css";
import { useService } from "../../../context/ServiceContext";

// ================= COMPONENTES AUXILIARES =================
const ToggleField = ({ field, label, formData, handleInputChange }) => (
  <div className="toggle-wrapper">
    <span className="toggle-label">{label}</span>
    <label className="switch">
      <input 
        type="checkbox" 
        checked={formData[field] || false} 
        onChange={e => handleInputChange(field, e.target.checked)} 
      />
      <span className="slider"></span>
    </label>
  </div>
);

// ================= MODAL PRINCIPAL =================
export default function EditServiceModal({ service, onSave, onClose }) {
  const { saveFilesService } = useService();

  // --- ESTADO INICIAL ---
  const [formData, setFormData] = useState({
    ...service,
    compatible_vehicles: service.compatible_vehicles || [],
    vehicle_make: "", 
    vehicle_model: "", 
    vehicle_year: "", 
    vehicle_trim: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  // --- HANDLERS ---
  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 10) return alert("Máximo 10 archivos permitidos.");
    const newFiles = files.map(file => ({
      url: URL.createObjectURL(file),
      mime_type: file.type,
      name: file.name,
      file
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedService = { 
      ...formData, 
      vehicle_year: formData.vehicle_year ? Number(formData.vehicle_year) : null,
      price: formData.price ? Number(formData.price) : 0,
      discount: formData.discount ? Number(formData.discount) : 0,
      difficulty_level: Number(formData.difficulty_level)
    };

    const saved = await onSave(updatedService);

    if (selectedFiles.length > 0 && (saved?.data?.id || saved?.id)) {
      const serviceId = saved?.data?.id ?? saved?.id;
      const filesJson = selectedFiles.map((f, idx) => ({ id: null, name: f.name, order: idx + 1 }));
      const localFiles = selectedFiles.map(f => f.file);
      await saveFilesService(serviceId, localFiles, filesJson);
    }
    onClose();
  };

  return (
    <div className="modalService-overlay">
      <div className="modalService-content">

        {/* HEADER */}
        <div className="modalService-header">
          <div className="header-title">
            <h2>Editar Servicio</h2>
            <p>Modifica los detalles del servicio seleccionado para actualizar el catálogo.</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}><IoClose size={24} /></button>
        </div>

        {/* BODY */}
        <div className="modalService-body">
          <form id="serviceForm" onSubmit={handleSubmit} className="form-content">

            {/* 1. INFORMACIÓN GENERAL */}
            <section className="form-section">
              <div className="section-header">
                <IoDocumentTextOutline className="section-icon" />
                <h3>Información General</h3>
              </div>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre del Servicio *</label>
                  <input type="text" value={formData.name} onChange={e => handleInputChange("name", e.target.value)} required placeholder="Ej: Diagnóstico Completo de Motor" />
                </div>
                <div className="form-group full-width">
                  <label>Descripción Corta *</label>
                  <input type="text" value={formData.short_description} onChange={e => handleInputChange("short_description", e.target.value)} required maxLength={120} placeholder="Resumen breve (máx 120 caracteres)" />
                </div>
                <div className="form-group full-width">
                  <label>Descripción Detallada</label>
                  <textarea value={formData.full_description} onChange={e => handleInputChange("full_description", e.target.value)} placeholder="Explica detalladamente en qué consiste el servicio..." />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <input list="category-options" value={formData.category} onChange={e => handleInputChange("category", e.target.value)} placeholder="Seleccione o escriba..." />
                  <datalist id="category-options">
                    <option value="Mantenimiento Preventivo"/><option value="Reparación Correctiva"/><option value="Diagnóstico"/><option value="Estética / Detailing"/><option value="Performance / Tuning"/>
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select value={formData.status} onChange={e => handleInputChange("status", e.target.value)}>
                    <option value="draft">Borrador (Oculto)</option>
                    <option value="active">Activo (Público)</option>
                    <option value="paused">Pausado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 2. COMPATIBILIDAD VEHICULAR */}
            <section className="form-section">
              <div className="section-header">
                <IoCarSportOutline className="section-icon" />
                <h3>Compatibilidad de Vehículo</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Marca</label>
                  <input value={formData.vehicle_make} onChange={e => handleInputChange("vehicle_make", e.target.value)} placeholder="Ej: Toyota" />
                </div>
                <div className="form-group">
                  <label>Modelo</label>
                  <input value={formData.vehicle_model} onChange={e => handleInputChange("vehicle_model", e.target.value)} placeholder="Ej: Corolla" />
                </div>
                <div className="form-group">
                  <label>Año</label>
                  <input type="number" value={formData.vehicle_year} onChange={e => handleInputChange("vehicle_year", e.target.value)} placeholder="Ej: 2023" />
                </div>
                <div className="form-group">
                  <label>Versión / Trim</label>
                  <input value={formData.vehicle_trim} onChange={e => handleInputChange("vehicle_trim", e.target.value)} placeholder="Ej: XLE Hybrid" />
                </div>

                <div className="form-group full-width">
                  <button type="button" className="button_cars_model" onClick={() => {
                      const { vehicle_make, vehicle_model, vehicle_year, vehicle_trim } = formData;
                      if (!vehicle_make && !vehicle_model && !vehicle_year && !vehicle_trim) return;
                      const newVehicle = {
                        marca: vehicle_make,
                        modelo: vehicle_model,
                        anio: vehicle_year ? Number(vehicle_year) : null,
                        version_trim: vehicle_trim
                      };
                      setFormData(prev => ({
                        ...prev,
                        compatible_vehicles: [...prev.compatible_vehicles, newVehicle],
                        vehicle_make: "", vehicle_model: "", vehicle_year: "", vehicle_trim: ""
                      }));
                    }}>
                    Agregar Vehículo Compatible
                  </button>
                </div>

                <div className="form-group full-width">
                  <div className="models-list">
                    {formData.compatible_vehicles.map((vehicle, idx) => (
                      <div key={idx} className="model-item">
                        {`${vehicle.marca || "-"} ${vehicle.modelo || "-"} ${vehicle.anio || "-"} ${vehicle.version_trim || "-"}`}
                        <IoClose size={14} style={{cursor:'pointer'}} onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            compatible_vehicles: prev.compatible_vehicles.filter((_, i) => i !== idx)
                          }));
                        }}/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 3. DETALLES TÉCNICOS */}
            <section className="form-section">
              <div className="section-header">
                <IoConstructOutline className="section-icon" />
                <h3>Detalles Técnicos</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tipo de Servicio</label>
                  <select value={formData.service_type} onChange={e => handleInputChange("service_type", e.target.value)}>
                    <option value="">Seleccione...</option>
                    <option value="mechanic">Mecánica General</option>
                    <option value="electric">Electricidad</option>
                    <option value="bodywork">Chonería y Pintura</option>
                    <option value="software">Software / Scanner</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nivel de Dificultad</label>
                  <select value={formData.difficulty_level} onChange={e => handleInputChange("difficulty_level", e.target.value)}>
                    <option value="1">1 - Básico</option>
                    <option value="2">2 - Intermedio</option>
                    <option value="3">3 - Avanzado</option>
                    <option value="4">4 - Especializado</option>
                    <option value="5">5 - Experto</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Modalidad</label>
                  <select value={formData.modality} onChange={e => handleInputChange("modality", e.target.value)}>
                    <option value="on-site">En Taller</option>
                    <option value="home-service">A Domicilio</option>
                    <option value="remote">Remoto / Consultoría</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Disponibilidad</label>
                  <select value={formData.availability} onChange={e => handleInputChange("availability", e.target.value)}>
                    <option value="available">Disponible Inmediatamente</option>
                    <option value="limited">Cupos Limitados</option>
                    <option value="waiting-list">Lista de Espera</option>
                  </select>
                </div>
                <ToggleField field="is_custom" label="¿Es un servicio personalizado?" formData={formData} handleInputChange={handleInputChange} />
                <ToggleField field="featured" label="¿Destacar en portada?" formData={formData} handleInputChange={handleInputChange} />
              </div>
            </section>

            {/* 4. PRECIO Y TIEMPO */}
            <section className="form-section">
              <div className="section-header">
                <IoPricetagOutline className="section-icon" />
                <h3>Precio y Tiempos</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Precio ($)</label>
                  <input type="number" min="0" step="0.01" value={formData.price} onChange={e => handleInputChange("price", e.target.value)} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Descuento (%)</label>
                  <input type="number" min="0" max="100" step="0.01" value={formData.discount} onChange={e => handleInputChange("discount", e.target.value)} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Duración Estimada</label>
                  <input type="text" value={formData.estimated_duration} onChange={e => handleInputChange("estimated_duration", e.target.value)} placeholder="Ej: 2 Días / 4 Horas" />
                </div>
                <div className="form-group">
                  <label>Garantía</label>
                  <input type="text" value={formData.warranty} onChange={e => handleInputChange("warranty", e.target.value)} placeholder="Ej: 6 Meses o 5000km" />
                </div>
              </div>
            </section>

            {/* 5. MULTIMEDIA */}
            {/* <section className="form-section">
              <div className="section-header">
                <IoImageOutline className="section-icon" />
                <h3>Galería Multimedia</h3>
              </div>
              <div className="upload-area" onClick={() => document.getElementById("fileUploadServiceEdit").click()}>
                <MdOutlineCloudUpload size={48} color="#94a3b8" />
                <p style={{margin: '10px 0 0', fontWeight: 500}}>Clic para subir imágenes o videos nuevos</p>
                <p style={{fontSize: '0.8rem', color: '#94a3b8', margin: 0}}>PNG, JPG, MP4 (Máx 10MB)</p>
                <input id="fileUploadServiceEdit" type="file" multiple accept="image/*,video/*" hidden onChange={handleFileChange} />
              </div>
              {selectedFiles.length > 0 && (
                <div className="file-list">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="file-card">
                      {file.mime_type.startsWith("video") ? <video src={file.url} /> : <img src={file.url} alt="preview" />}
                      <div className="file-remove" onClick={() => removeFile(idx)}><IoClose size={16} /></div>
                    </div>
                  ))}
                </div>
              )}
            </section> */}

          </form>
        </div>

        {/* FOOTER */}
        <div className="modalService-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" form="serviceForm" className="btn-primary">Actualizar Servicio</button>
        </div>

      </div>
    </div>
  );
}
