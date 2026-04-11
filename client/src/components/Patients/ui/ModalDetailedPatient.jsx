import React, { useState, useEffect } from "react";
import { 
  FileText, Pencil, Trash2, X, 
  Image as ImageIcon, Maximize2, 
  Phone, Mail, CreditCard, User 
} from "lucide-react";
// Styles
import "../../../styles/ui/ModalDetailedPatient.css";

const ModalDetailedPatient = ({ 
  isOpen, 
  onClose, 
  paciente, 
  seguros, 
  onEdit, 
  onDelete, 
  onViewStories 
}) => {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Resetear el índice de imagen cuando cambia el paciente o se abre el modal
  useEffect(() => {
    if (isOpen) {
      setSelectedImgIdx(0);
      setIsZoomOpen(false);
    }
  }, [isOpen, paciente?.id]);

  if (!isOpen || !paciente) return null;

  const nombreSeguro = seguros.find((s) => s.id === paciente.id_seguro)?.nombre || "Particular";
  
  // Manejo de imágenes (asumiendo estructura similar a productos)
  const images = paciente.images || [];
  const currentImage = images.length > 0 ? images[selectedImgIdx] : null;
  const currentImageSrc = currentImage ? `data:${currentImage.mime_type};base64,${currentImage.data}` : null;

  return (
    <div className="modalPatients-modal-overlay">
      <div className="modalPatients-modal-content">
        {/* HEADER */}
        <div className="modalPatients-details-header">
          <div className="modalPatients-avatar-circle">
            {paciente.nombre.charAt(0)}
          </div>
          <div>
            <h3>{paciente.nombre}</h3>
            <span className="modalPatients-badge-id">PACIENTE #{paciente.id}</span>
          </div>
          <button className="modalPatients-btn-close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* HERO SECTION: IMÁGENES Y DATOS RÁPIDOS */}
        <div className="modalPatients-details-hero">
          {/* SECCIÓN DE IMÁGENES */}
          <div className="modalPatients-image-section">
            <div 
              className={`modalPatients-image-main-container ${currentImage ? 'zoom-enabled' : ''}`}
              onClick={() => currentImage && setIsZoomOpen(true)}
            >
              {currentImage ? (
                <>
                  <img src={currentImageSrc} alt="Documento paciente" className="modalPatients-image-view" />
                  <div className="modalPatients-image-hover-icon">
                    <Maximize2 size={20} />
                  </div>
                </>
              ) : (
                <div className="modalPatients-image-placeholder">
                  <ImageIcon size={40} strokeWidth={1.5} />
                  <span>Sin documentos</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="modalPatients-thumbnail-list">
                {images.map((img, idx) => (
                  <img 
                    key={img.id || idx}
                    src={`data:${img.mime_type};base64,${img.data}`}
                    className={`modalPatients-thumb ${selectedImgIdx === idx ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImgIdx(idx);
                    }}
                    alt={`Documento ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* GRID DE INFORMACIÓN */}
          <div className="modalPatients-details-grid">
            <div className="modalPatients-detail-item">
              <span className="modalPatients-detail-icon"><CreditCard size={18} /></span>
              <div>
                <label>Documento</label>
                <p>{paciente.documento}</p>
              </div>
            </div>
            <div className="modalPatients-detail-item">
              <span className="modalPatients-detail-icon"><Phone size={18} /></span>
              <div>
                <label>Teléfono</label>
                <p>{paciente.telefono ? `+${paciente.telefono}` : "-"}</p>
              </div>
            </div>
            <div className="modalPatients-detail-item">
              <span className="modalPatients-detail-icon"><Mail size={18} /></span>
              <div>
                <label>Email</label>
                <p>{paciente.email || "-"}</p>
              </div>
            </div>
            <div className="modalPatients-detail-item">
              <span className="modalPatients-detail-icon">🏥</span>
              <div>
                <label>Seguro Médico</label>
                <p>{nombreSeguro}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="modalPatients-details-actions">
          <button
            className="modalPatients-btn-action-outline"
            onClick={() => {
              onClose();
              onViewStories();
            }}
          >
            <FileText size={18} /> Ver Historias Clínicas
          </button>
          
          <div className="modalPatients-action-row">
            <button
              className="modalPatients-btn-edit-soft"
              onClick={() => onEdit(paciente)}
            >
              <Pencil size={18} /> Editar
            </button>
            <button
              className="modalPatients-btn-danger-soft"
              onClick={() => {
                onClose();
                onDelete();
              }}
            >
              <Trash2 size={18} /> Eliminar
            </button>
          </div>

          <button className="modalPatients-btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      {/* MODAL DE ZOOM (Basado en tu guía) */}
      {isZoomOpen && (
        <div className="pdm-zoom-overlay" onClick={() => setIsZoomOpen(false)}>
          <button className="pdm-zoom-close" onClick={() => setIsZoomOpen(false)}>
            <X size={32} />
          </button>
          <img 
            src={currentImageSrc} 
            alt="Zoom" 
            className="pdm-zoom-image" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default ModalDetailedPatient;