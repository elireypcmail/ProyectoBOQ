import React, { useState, useEffect, useMemo } from "react";
import {
  X, Calendar, User, Stethoscope, FileText,
  Image as ImageIcon, Hash, Pencil, Loader2, Maximize2
} from "lucide-react";
import { useHealth } from "../../../context/HealtContext";
import "../../../styles/ui/ModalDetailedHistory.css";

const ModalDetailedHistory = ({ isOpen, historia: initialHistoria, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [detailedHistoria, setDetailedHistoria] = useState(null);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  const { getHistoriaById } = useHealth();

  useEffect(() => {
    const fetchFullDetail = async () => {
      if (isOpen && initialHistoria?.id) {
        setIsLoading(true);
        // Limpiar estado previo para evitar mostrar info antigua durante la carga
        setDetailedHistoria(null); 
        setSelectedImgIdx(0);
        
        try {
          const res = await getHistoriaById(initialHistoria.id);
          // Estandarizar extracción de datos
          const freshData = res?.data || res;
          if (freshData) setDetailedHistoria(freshData);
        } catch (error) {
          console.error("Error al obtener el detalle de la historia:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchFullDetail();
  }, [isOpen, initialHistoria?.id]);

  // Prioridad: 1. Datos detallados de la API | 2. Item inicial de la lista
  const h = detailedHistoria || initialHistoria;

  if (!isOpen || !h) return null;

  const images = Array.isArray(h.images) ? h.images : [];
  const currentImage = images.length > 0 ? images[selectedImgIdx] : null;

  const getImgSrc = (img) => {
    if (!img) return null;
    if (img.mime_type && img.data) {
      return `data:${img.mime_type};base64,${img.data}`;
    }
    const raw = img.file || img.base64 || img.data || img;
    if (typeof raw !== 'string') return null;
    return raw.startsWith('data:image') ? raw : `data:image/png;base64,${raw}`;
  };

  const currentImageSrc = getImgSrc(currentImage);

  return (
    <div className="detailed-history-overlay">
      <div className="detailed-history-card">
        
        {/* CABECERA */}
        <div className="stories-modal-header">
          <div className="stories-modal-title-group">
            <div className="stories-modal-icon-bg">
              {isLoading ? (
                <Loader2 className="animate-spin" size={22} color="var(--ins-primary)" />
              ) : (
                <FileText size={22} color="var(--ins-primary)" />
              )}
            </div>
            <div>
              <h3 className="stories-modal-title">Reporte Clínico</h3>
              <p className="stories-modal-subtitle">
                {isLoading ? "Actualizando información..." : "Documentación Oficial"}
              </p>
            </div>
          </div>
          <button className="stories-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="detailed-history-body">
          {/* GRID DE INFORMACIÓN */}
          <div className="detailed-info-grid">
            <div className="info-item">
              <label><Hash size={12} /> ID Registro</label>
              <span className="id-highlight">#{h.id}</span>
            </div>
            <div className="info-item">
              <label><User size={12} /> Paciente</label>
              <span style={{ fontWeight: 600 }}>{h.paciente_nombre || h.paciente?.nombre || "---"}</span>
            </div>
            <div className="info-item">
              <label><Stethoscope size={12} /> Médico</label>
              <span>{h.medico_nombre || h.medico?.nombre || "---"}</span>
            </div>
            <div className="info-item">
              <label><Calendar size={12} /> Fecha</label>
              <span>{h.fecha_creacion ? new Date(h.fecha_creacion).toLocaleDateString() : "---"}</span>
            </div>
          </div>

          <div className="detailed-section-title"><Pencil size={14} /> Detalle Médico</div>
          <div className="detailed-text-report">
            {h.detalle || "No hay observaciones registradas."}
          </div>

          <div className="detailed-section-title"><ImageIcon size={14} /> Estudios y Resultados</div>
          
          {isLoading ? (
            <div className="loading-files-placeholder">
              <Loader2 className="animate-spin" size={30} color="var(--ins-primary)" />
              <p>Recuperando adjuntos...</p>
            </div>
          ) : (
            <div className="pdm-image-section" style={{ padding: 0 }}>
              <div 
                className={`pdm-image-container ${currentImage ? 'zoom-enabled' : ''}`}
                onClick={() => currentImage && setIsZoomOpen(true)}
              >
                {currentImage ? (
                  <>
                    <img src={currentImageSrc} alt="Estudio" className="pdm-image-view" />
                    <div className="pdm-image-hover-icon"><Maximize2 size={20} /></div>
                  </>
                ) : (
                  <div className="pdm-image-placeholder">
                    <ImageIcon size={48} strokeWidth={1.5} />
                    <span>Sin imágenes adjuntas</span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="pdm-thumbnail-list">
                  {images.map((img, idx) => (
                    <img 
                      key={img.id || idx}
                      src={getImgSrc(img)}
                      className={`pdm-thumb ${selectedImgIdx === idx ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setSelectedImgIdx(idx); }}
                      alt={`Miniatura ${idx + 1}`}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/60?text=Error"; }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="stories-modal-footer">
          <button className="stories-btn-primary" style={{ width: "100%" }} onClick={onClose}>
            Cerrar Reporte
          </button>
        </div>
      </div>

      {/* MODAL DE ZOOM */}
      {isZoomOpen && (
        <div className="pdm-zoom-overlay" onClick={() => setIsZoomOpen(false)}>
          <button className="pdm-zoom-close" onClick={() => setIsZoomOpen(false)}><X size={32} /></button>
          <img 
            src={currentImageSrc} 
            alt="Vista Ampliada" 
            className="pdm-zoom-image" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default ModalDetailedHistory;