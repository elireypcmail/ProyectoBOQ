import React, { useState } from "react";
import { Pencil, Trash2, X, Image as ImageIcon, Maximize2 } from "lucide-react";

// Importación del CSS único
import "../../../styles/ui/ModalDetailedSupplier.css";

const SupplierDetailModal = ({ 
  isOpen, 
  onClose, 
  supplier, 
  onEdit, 
  onDelete 
}) => {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  if (!isOpen || !supplier) return null;

  const images = supplier.images || [];
  const currentImage = images.length > 0 ? images[selectedImgIdx] : null;
  const currentImageSrc = currentImage ? `data:${currentImage.mime_type};base64,${currentImage.data}` : null;

  const handleClose = () => {
    setSelectedImgIdx(0);
    setIsZoomOpen(false);
    onClose();
  };

  return (
    <div className="sdm-overlay">
      <div className="sdm-content">
        {/* HEADER */}
        <div className="sdm-header">
          <div className="sdm-title-group">
            <h3>Detalles del Proveedor</h3>
            <span className={`sdm-status-badge ${supplier.estatus ? 'active' : 'inactive'}`}>
              {supplier.estatus ? "Activo" : "Inactivo"}
            </span>
          </div>
          <button className="sdm-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="sdm-body-layout">
          {/* SECCIÓN IZQUIERDA: IMÁGENES / DOCUMENTOS */}
          <div className="sdm-image-section">
            <div 
              className={`sdm-main-image-container ${currentImage ? 'zoom-enabled' : ''}`}
              onClick={() => currentImage && setIsZoomOpen(true)}
            >
              {currentImage ? (
                <>
                  <img src={currentImageSrc} alt={supplier.nombre} className="sdm-main-img" />
                  <div className="sdm-image-hover-icon">
                    <Maximize2 size={20} />
                  </div>
                </>
              ) : (
                <div className="sdm-image-placeholder">
                  <ImageIcon size={48} strokeWidth={1.5} />
                  <span>Sin archivos</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="sdm-thumbnail-list">
                {images.map((img, idx) => (
                  <img 
                    key={img.id || idx}
                    src={`data:${img.mime_type};base64,${img.data}`}
                    className={`sdm-thumb ${selectedImgIdx === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImgIdx(idx)}
                    alt="thumbnail"
                  />
                ))}
              </div>
            )}
          </div>

          {/* SECCIÓN DERECHA: INFORMACIÓN */}
          <div className="sdm-info-grid">
            <div className="sdm-detail-card">
              <strong>ID</strong>
              <span className="sdm-id-tag">#{supplier.id}</span>
            </div>

            <div className="sdm-detail-card">
              <strong>Nombre</strong>
              <span>{supplier.nombre}</span>
            </div>

            <div className="sdm-detail-card">
              <strong>Documento</strong>
              <span>{supplier.documento || "—"}</span>
            </div>

            <div className="sdm-detail-card">
              <strong>Teléfono</strong>
              <span>{supplier.telefono ? `+${supplier.telefono}` : "—"}</span>
            </div>

            <div className="sdm-detail-card sdm-full-width">
              <strong>Email</strong>
              <span>{supplier.email || "—"}</span>
            </div>
            
            <div className="sdm-detail-card sdm-full-width sdm-bank-section">
              <strong>Datos Bancarios</strong>
              <p>{supplier.datos_bancarios || "No hay registros bancarios cargados."}</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="sdm-footer">
          <div className="sdm-actions-left">
            <button 
              className="sdm-btn-edit" 
              onClick={() => { handleClose(); onEdit(supplier); }}
            >
              <Pencil size={16} /> Editar
            </button>
            
            <button 
              className="sdm-btn-delete" 
              onClick={() => { handleClose(); onDelete(); }}
            >
              <Trash2 size={16} /> Eliminar
            </button>
          </div>
          
          <button className="sdm-btn-secondary" onClick={handleClose}>
            Cerrar
          </button>
        </div>
      </div>

      {/* MODAL DE ZOOM (LIGHTBOX) */}
      {isZoomOpen && (
        <div className="sdm-zoom-overlay" onClick={() => setIsZoomOpen(false)}>
          <button className="sdm-zoom-close" onClick={() => setIsZoomOpen(false)}>
            <X size={32} />
          </button>
          <img 
            src={currentImageSrc} 
            alt="Zoomed" 
            className="sdm-zoom-image" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default SupplierDetailModal;