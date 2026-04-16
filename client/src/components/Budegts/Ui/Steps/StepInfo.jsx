import React, { useEffect, useMemo } from "react";
import Select from "react-select";
import { UserCircle, Building2, ShieldCheck, FileText, CheckSquare, Square } from "lucide-react";
import "../../../../styles/ui/stepsBudgets/StepInfo.css";

import { useHealth } from "../../../../context/HealtContext";
import { useClinics } from "../../../../context/ClinicsContext";

const StepInfo = ({ formData, setFormData, onValidationChange }) => {
  const { pacientes, seguros, getAllPacientes, getAllSeguros } = useHealth();
  const { clinics, getAllClinics } = useClinics();

  useEffect(() => {
    getAllPacientes();
    getAllSeguros();
    getAllClinics();
  }, []);

  useEffect(() => {
    const isValid = formData.id_paciente !== "";
    onValidationChange?.(isValid);
  }, [formData.id_paciente, onValidationChange]);

  const buildOptions = (data, labelKey = "nombre") =>
    (data || []).map((item) => ({
      ...item,
      value: item.id,
      label: item[labelKey]?.toUpperCase(),
    }));

  const selectValue = (options, value) =>
    options.find((opt) => opt.value === value) || null;

  const pacienteOptions = useMemo(() => buildOptions(pacientes), [pacientes]);
  const insuranceOptions = useMemo(() => buildOptions(seguros), [seguros]);
  const clinicOptions = useMemo(() => buildOptions(clinics), [clinics]);

  const handleParticularChange = () => {
    const newVal = !formData.particular;
    setFormData((p) => ({
      ...p,
      particular: newVal,
      // Al activar particular, forzamos la limpieza del seguro
      ...(newVal ? { 
        id_seguro: null, 
        nombre_seguro: "" 
      } : {}),
    }));
  };

  const profSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "12px",
      borderColor: state.isFocused ? "#ec3137" : "#e2e8f0",
      minHeight: "48px",
      backgroundColor: state.isDisabled ? "#f1f5f9" : "#fff", // Color más grisáceo si está deshabilitado
      boxShadow: "none",
      transition: "all 0.3s ease",
      "&:hover": { borderColor: "#ec3137" },
    }),
    placeholder: (base) => ({ ...base, fontSize: "0.9rem", color: "#a0aec0", fontWeight: "400" }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      border: "1px solid #f1f5f9",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.85rem",
      backgroundColor: state.isSelected ? "#ec3137" : state.isFocused ? "#fff5f5" : "transparent",
      color: state.isSelected ? "#fff" : "#334155",
      "&:active": { backgroundColor: "#ec3137" },
    }),
  };

  return (
    <section className="prof-container">
      <div className="prof-header">
        <h3 className="prof-title">Información de la Proforma</h3>
        <p className="prof-subtitle">Complete los datos básicos para generar el presupuesto.</p>
      </div>

      <div className="prof-main-card">
        <h4 className="prof-card-tag">Datos Principales</h4>

        <div className="prof-field-group">
          <label className="prof-label">
            <UserCircle size={18} className="prof-icon" /> PACIENTE *
          </label>
          <Select
            isClearable
            options={pacienteOptions}
            value={selectValue(pacienteOptions, formData.id_paciente)}
            onChange={(opt) =>
              setFormData((p) => ({
                ...p,
                id_paciente: opt?.value || "",
                nombre_paciente: opt?.label || "",
              }))
            }
            placeholder="BUSCAR PACIENTE..."
            styles={profSelectStyles}
          />
        </div>

        <div className="prof-grid-layout">
          {/* Campo SEGURO con Checkbox de Particular integrado */}
          <div className="prof-field-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label className="prof-label" style={{ margin: 0 }}>
                <ShieldCheck size={18} className="prof-icon" /> SEGURO
              </label>
              
              <div
                onClick={handleParticularChange}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: formData.particular ? "#ec3137" : "#64748b",
                  userSelect: "none"
                }}
              >
                {formData.particular ? <CheckSquare size={16} /> : <Square size={16} />}
                PARTICULAR
              </div>
            </div>

            <Select
              isClearable
              isDisabled={formData.particular} // Deshabilitar si es particular
              options={insuranceOptions}
              value={formData.particular ? null : selectValue(insuranceOptions, formData.id_seguro)}
              onChange={(opt) =>
                setFormData((p) => ({
                  ...p,
                  id_seguro: opt?.value || null,
                  nombre_seguro: opt?.label || "",
                }))
              }
              placeholder={formData.particular ? "N/A (PARTICULAR)" : "SELECCIONAR..."}
              styles={profSelectStyles}
            />
          </div>

          <div className="prof-field-group">
            <label className="prof-label">
              <Building2 size={18} className="prof-icon" /> CLÍNICA
            </label>
            <Select
              isClearable
              options={clinicOptions}
              value={selectValue(clinicOptions, formData.id_clinica)}
              onChange={(opt) =>
                setFormData((p) => ({
                  ...p,
                  id_clinica: opt?.value || null,
                  nombre_clinica: opt?.label || "",
                }))
              }
              placeholder="OPCIONAL"
              styles={profSelectStyles}
            />
          </div>
        </div>

        <div className="prof-field-group" style={{ marginTop: "20px" }}>
          <label className="prof-label">
            <FileText size={18} className="prof-icon" /> NOTAS / OBSERVACIONES
          </label>
          <textarea
            value={formData.notas}
            onChange={(e) => setFormData((p) => ({ ...p, notas: e.target.value.toUpperCase() }))}
            placeholder="OPCIONAL: Ingrese notas o comentarios adicionales..."
            rows={3}
            style={{
              width: "100%",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "12px 14px",
              fontSize: "0.9rem",
              color: "#334155",
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              transition: "all 0.3s ease",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#ec3137")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>
      </div>
    </section>
  );
};

export default StepInfo;