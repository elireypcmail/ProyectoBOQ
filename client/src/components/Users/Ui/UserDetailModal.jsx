import React, { useState, useEffect } from "react";
import { 
  X, Pencil, Trash2, Mail, Phone, 
  ShieldCheck, MapPin, Warehouse, User as UserIcon
} from "lucide-react";
import "../../../styles/ui/UserDetailModal.css";

const UserDetailModal = ({ isOpen, onClose, user: userData, onEdit, onDelete }) => {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Normalizamos si la data viene en un array o como objeto directo
  const user = Array.isArray(userData) ? userData[0] : userData;

  useEffect(() => {
    if (isOpen) {
      setIsZoomOpen(false);
    }
  }, [isOpen, user?.id]);

  if (!isOpen || !user) return null;

  // Lógica para determinar si mostrar Oficina o Depósito
  // Se ocultan si el ID es 0, null o si no hay un nombre asignado
  const hasOficina = user.id_oficina !== 0 && (user.nombre_oficina || user.oficina);
  const hasDeposito = user.id_deposito !== 0 && (user.nombre_deposito || user.deposito);

  return (
    <div className="udm-overlay">
      <div className="udm-container">
        {/* HEADER */}
        <div className="udm-header">
          <div className="udm-avatar-wrapper">
            <div className="udm-avatar-placeholder">
              {user.nombre?.charAt(0).toUpperCase() || <UserIcon size={24} />}
            </div>
          </div>
          <div className="udm-header-info">
            <h3>{user.nombre}</h3>
            <span className="udm-id-badge">ID: {user.id}</span>
          </div>
          <button className="udm-btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="udm-body">
          <div className="udm-info-grid">
            {/* EMAIL */}
            <div className="udm-info-card">
              <span className="udm-icon"><Mail size={18} /></span>
              <div className="udm-info-text">
                <label>Correo Electrónico</label>
                <p>{user.email || "No registrado"}</p>
              </div>
            </div>

            {/* TELÉFONO */}
            <div className="udm-info-card">
              <span className="udm-icon"><Phone size={18} /></span>
              <div className="udm-info-text">
                <label>Teléfono</label>
                <p>{user.telefono || "N/A"}</p>
              </div>
            </div>

            {/* ROL */}
            <div className="udm-info-card">
              <span className="udm-icon"><ShieldCheck size={18} /></span>
              <div className="udm-info-text">
                <label>Rol de Acceso</label>
                <p className="udm-text-highlight">{user.rol?.toUpperCase() || "USUARIO"}</p>
              </div>
            </div>

            {/* OFICINA (Solo si existe) */}
            {hasOficina && (
              <div className="udm-info-card">
                <span className="udm-icon"><MapPin size={18} /></span>
                <div className="udm-info-text">
                  <label>Oficina Asignada</label>
                  <p>{user.nombre_oficina || user.oficina}</p>
                </div>
              </div>
            )}

            {/* DEPÓSITO (Solo si existe) */}
            {hasDeposito && (
              <div className="udm-info-card">
                <span className="udm-icon"><Warehouse size={18} /></span>
                <div className="udm-info-text">
                  <label>Depósito Principal</label>
                  <p>{user.nombre_deposito || user.deposito}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ACCIONES */}
        <div className="udm-footer">
          <div className="udm-action-group">
            <button className="udm-btn-edit" onClick={() => onEdit(user)}>
              <Pencil size={18} /> Editar Usuario
            </button>
            
            {onDelete && (
              <button
                className="udm-btn-delete"
                onClick={() => {
                  if(window.confirm("¿Está seguro de eliminar este usuario?")) {
                    onDelete(user.id);
                    onClose();
                  }
                }}
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
          <button className="udm-btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;