import React, { useEffect, useMemo } from "react";
import Select from "react-select";
import { UserCircle, Building2, ShieldCheck, FileText } from "lucide-react"; // <-- Added FileText icon
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

  const profSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "12px",
      borderColor: state.isFocused ? "#ec3137" : "#e2e8f0",
      minHeight: "48px",
      backgroundColor: "#fff",
      boxShadow: "none",
      transition: "all 0.3s ease",
      "&:hover": { borderColor: "#ec3137" }
    }),
    placeholder: (base) => ({ ...base, fontSize: "0.9rem", color: "#a0aec0", fontWeight: "400" }),
    menu: (base) => ({ 
      ...base, 
      zIndex: 9999, 
      borderRadius: "12px", 
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      border: "1px solid #f1f5f9"
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.85rem",
      backgroundColor: state.isSelected ? "#ec3137" : state.isFocused ? "#fff5f5" : "transparent",
      color: state.isSelected ? "#fff" : "#334155",
      "&:active": { backgroundColor: "#ec3137" }
    })
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
            onChange={(opt) => setFormData(p => ({
              ...p,
              id_paciente: opt?.value || "",
              nombre_paciente: opt?.label || ""
            }))}
            placeholder="BUSCAR PACIENTE..."
            styles={profSelectStyles}
          />
        </div>

        <div className="prof-grid-layout">
          <div className="prof-field-group">
            <label className="prof-label">
              <ShieldCheck size={18} className="prof-icon" /> SEGURO
            </label>
            <Select
              isClearable
              options={insuranceOptions}
              value={selectValue(insuranceOptions, formData.id_seguro)}
              onChange={(opt) => setFormData(p => ({ 
                ...p, 
                id_seguro: opt?.value || null,
                nombre_seguro: opt?.label || ""
              }))}
              placeholder="OPCIONAL"
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
              onChange={(opt) => setFormData(p => ({ 
                ...p, 
                id_clinica: opt?.value || null,
                nombre_clinica: opt?.label || ""
              }))}
              placeholder="OPCIONAL"
              styles={profSelectStyles}
            />
          </div>
        </div>

        {/* --- Added Notes Field --- */}
        <div className="prof-field-group" style={{ marginTop: "20px" }}>
          <label className="prof-label">
            <FileText size={18} className="prof-icon" /> NOTAS / OBSERVACIONES
          </label>
          <textarea
            value={formData.notas}
            onChange={(e) => setFormData(p => ({ ...p, notas: e.target.value.toUpperCase() }))}
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
              transition: "border-color 0.3s ease",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#ec3137")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>
        {/* ------------------------- */}

      </div>
    </section>
  );
};

export default StepInfo;