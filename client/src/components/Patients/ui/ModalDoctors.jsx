// ModalDoctors.jsx — Solo fechas, sin selección de médico
import React, { useEffect, useState } from "react";
import { X, Search, Calendar } from "lucide-react";
import "../../../styles/ui/ModalDetailedDoctor.css";

const ModalDoctors = ({ isOpen, onClose, onSearch }) => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin]       = useState("");
  const [errors, setErrors]           = useState({});

  useEffect(() => {
    if (isOpen) {
      setFechaInicio("");
      setFechaFin("");
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!fechaInicio) newErrors.fechaInicio = "La fecha de inicio es requerida";
    if (!fechaFin)    newErrors.fechaFin    = "La fecha de fin es requerida";
    if (fechaInicio && fechaFin && fechaInicio > fechaFin)
      newErrors.fechaFin = "La fecha de fin debe ser mayor a la de inicio";
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    onSearch({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
  };

  if (!isOpen) return null;

  return (
    <div className="ddm-overlay">
      <div className="ddm-content">

        <div className="ddm-header">
          <div className="ddm-profile-section">
            <div className="ddm-avatar">
              <Calendar size={28} />
            </div>
            <div>
              <h3 className="ddm-title">Consultar Operaciones</h3>
              <span className="ddm-badge-active">Selecciona un rango de fechas</span>
            </div>
          </div>
          <button onClick={onClose} className="ddm-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="ddm-body">
          <div className="ddm-info-grid">

            <div className="ddm-info-item">
              <div className="ddm-icon-box"><Calendar size={16} /></div>
              <div className="ddm-text-group">
                <label>Fecha Inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => {
                    setFechaInicio(e.target.value);
                    setErrors((prev) => ({ ...prev, fechaInicio: null }));
                  }}
                  style={{
                    border: "none", outline: "none", background: "transparent",
                    fontSize: "13px", color: "var(--ddm-text, #1e293b)",
                    padding: "2px 0", width: "100%",
                  }}
                />
                {errors.fechaInicio && (
                  <span style={{ color: "red", fontSize: "11px" }}>{errors.fechaInicio}</span>
                )}
              </div>
            </div>

            <div className="ddm-info-item">
              <div className="ddm-icon-box"><Calendar size={16} /></div>
              <div className="ddm-text-group">
                <label>Fecha Fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => {
                    setFechaFin(e.target.value);
                    setErrors((prev) => ({ ...prev, fechaFin: null }));
                  }}
                  style={{
                    border: "none", outline: "none", background: "transparent",
                    fontSize: "13px", color: "var(--ddm-text, #1e293b)",
                    padding: "2px 0", width: "100%",
                  }}
                />
                {errors.fechaFin && (
                  <span style={{ color: "red", fontSize: "11px" }}>{errors.fechaFin}</span>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="ddm-footer">
          <div className="ddm-actions-main">
            <button className="ddm-btn-edit" onClick={handleSubmit}>
              <Search size={16} /> Consultar
            </button>
            <button className="ddm-btn-close" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ModalDoctors;