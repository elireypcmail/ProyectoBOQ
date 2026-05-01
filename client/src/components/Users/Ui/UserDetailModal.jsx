import React, { useState, useEffect } from "react";
import { 
  X, Pencil, Trash2, Mail, Phone, 
  ShieldCheck, MapPin, Warehouse, User as UserIcon,
  Loader2, Maximize2, Image as ImageIcon, Briefcase
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import "../../../styles/ui/UserDetailModal.css";

const UserDetailModal = ({ isOpen, onClose, user: initialUserData, onEdit, onDelete }) => {
  const [detailedUser, setDetailedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  
  const { fetchUserById } = useAuth();
  const userBase = Array.isArray(initialUserData) ? initialUserData[0] : initialUserData;

  useEffect(() => {
    const fetchFreshData = async () => {
      if (isOpen && userBase?.id) {
        setIsLoading(true);
        setIsZoomOpen(false);
        try {
          const freshData = await fetchUserById(userBase.id);
          setDetailedUser(freshData);
        } catch (error) {
          console.error("Error cargando detalle de usuario:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchFreshData();
  }, [isOpen, userBase?.id, fetchUserById]);

  if (!isOpen || !userBase) return null;

  const user = detailedUser || userBase;
  const images = user.images || (user.firma ? [user.firma] : []);
  const currentImage = images.length > 0 ? images[0] : null;
  const currentImageSrc = currentImage ? `data:${currentImage.mime_type};base64,${currentImage.data}` : null;

  const hasOficina = user.id_oficina !== 0 && (user.nombre_oficina || user.oficina);
  const hasDeposito = user.id_deposito !== 0 && (user.nombre_deposito || user.deposito);

  return (
    <div className="udm-overlay">
      <div className="udm-container">
        {/* HEADER CON BANNER */}
        <div className="udm-banner"></div>
        <div className="udm-header">
          <div className="udm-avatar-container">
            <div className="udm-avatar-wrapper">
              {isLoading ? (
                <div className="udm-avatar-placeholder"><Loader2 className="animate-spin" /></div>
              ) : (
                <div className="udm-avatar-circle">
                  {user.nombre?.charAt(0).toUpperCase() || <UserIcon size={30} />}
                </div>
              )}
            </div>
          </div>
          
          <div className="udm-header-info">
            <div className="udm-title-row">
              <h3>{user.nombre?.toUpperCase()}</h3>
              <span className={`udm-role-badge ${user.rol?.toLowerCase()}`}>
                {user.rol?.toUpperCase() || "USUARIO"}
              </span>
            </div>
            <p className="udm-user-id">ID de Registro: #{user.id}</p>
          </div>

          <button className="udm-btn-close-top" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="udm-body">
          <div className="udm-scroll-content">
            
            {/* SECCIÓN DE CONTACTO */}
            <div className="udm-section">
              <h4 className="udm-section-title">Información de Contacto</h4>
              <div className="udm-info-grid">
                <div className="udm-info-item">
                  <div className="udm-info-icon"><Mail size={16} /></div>
                  <div className="udm-info-content">
                    <label>Correo Electrónico</label>
                    <p>{user.email || "No registrado"}</p>
                  </div>
                </div>
                <div className="udm-info-item">
                  <div className="udm-info-icon"><Phone size={16} /></div>
                  <div className="udm-info-content">
                    <label>Teléfono Movil</label>
                    <p>{user.telefono || "Sin teléfono"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN DE ASIGNACIÓN */}
            {(hasOficina || hasDeposito) && (
              <div className="udm-section">
                <h4 className="udm-section-title">Asignación Laboral</h4>
                <div className="udm-info-grid">
                  {hasOficina && (
                    <div className="udm-info-item">
                      <div className="udm-info-icon assignment"><MapPin size={16} /></div>
                      <div className="udm-info-content">
                        <label>Sede / Oficina</label>
                        <p>{user.nombre_oficina || user.oficina}</p>
                      </div>
                    </div>
                  )}
                  {hasDeposito && (
                    <div className="udm-info-item">
                      <div className="udm-info-icon assignment"><Warehouse size={16} /></div>
                      <div className="udm-info-content">
                        <label>Almacén / Depósito</label>
                        <p>{user.nombre_deposito || user.deposito}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECCIÓN DE FIRMA */}
            <div className="udm-section">
              <h4 className="udm-section-title">Firma Digital</h4>
              <div 
                className={`udm-signature-card ${currentImage ? 'has-image' : 'is-empty'}`}
                onClick={() => currentImage && setIsZoomOpen(true)}
              >
                {currentImage ? (
                  <>
                    <img src={currentImageSrc} alt="Firma" />
                    <div className="udm-sig-overlay">
                      <Maximize2 size={24} />
                      <span>Ver pantalla completa</span>
                    </div>
                  </>
                ) : (
                  <div className="udm-sig-placeholder">
                    <ImageIcon size={32} />
                    <p>No se ha registrado una firma aún</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="udm-footer">
          <div className="udm-actions-main">
            <button className="udm-btn-edit" onClick={() => onEdit(user)} disabled={isLoading}>
              <Pencil size={18} /> Editar Perfil
            </button>
            {onDelete && (
              <button 
                className="udm-btn-delete" 
                title="Eliminar Usuario"
                onClick={() => {
                  if(window.confirm("¿Confirmas la eliminación de este usuario?")) {
                    onDelete(user.id);
                    onClose();
                  }
                }}
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
          <button className="udm-btn-cancel" onClick={onClose}>Cerrar</button>
        </div>
      </div>

      {/* ZOOM MODAL */}
      {isZoomOpen && (
        <div className="udm-zoom-overlay" onClick={() => setIsZoomOpen(false)}>
          <div className="udm-zoom-content">
            <button className="udm-zoom-close"><X size={30} /></button>
            <img src={currentImageSrc} alt="Firma Expandida" />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailModal;