import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { 
  UserCircle, 
  Building2, 
  ShieldCheck, 
  FileText, 
  CheckSquare, 
  Square, 
  Stethoscope, 
  Plus, 
  Trash2 
} from "lucide-react";
import "../../../../styles/ui/stepsBudgets/StepInfo.css";

import { useHealth } from "../../../../context/HealtContext";
import { useClinics } from "../../../../context/ClinicsContext";
import DoctorFormModal from "../../../Patients/ui/DoctorFormModal";

const StepInfo = ({ formData, setFormData, onValidationChange }) => {
  const { 
    pacientes, 
    seguros, 
    medicos, 
    tipoMedicos,
    getAllPacientes, 
    getAllSeguros, 
    getAllMedicos,
    getAllTipoMedicos,
    createNewMedico 
  } = useHealth();
  
  const { clinics, getAllClinics } = useClinics();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  useEffect(() => {
    getAllPacientes();
    getAllSeguros();
    getAllClinics();
    getAllMedicos();
    getAllTipoMedicos();
  }, []);

  useEffect(() => {
    // Validación: Paciente es requerido
    const isValid = formData.id_paciente !== "";
    onValidationChange?.(isValid);
  }, [formData.id_paciente, onValidationChange]);

  const options = useMemo(() => ({
    pacientes: (pacientes || []).map((p) => ({
      value: p.id,
      label: p.nombre?.toUpperCase(),
    })),
    seguros: (seguros || []).map((s) => ({
      value: s.id,
      label: s.nombre?.toUpperCase(),
    })),
    clinicas: (clinics || []).map((c) => ({
      value: c.id,
      label: c.nombre?.toUpperCase(),
    })),
    medicos: (medicos || []).map((m) => ({
      value: m.id,
      label: m.nombre?.toUpperCase(),
      tipo: m.tipo?.toUpperCase() || "GENERAL",
    })),
  }), [pacientes, seguros, clinics, medicos]);

  const selectValue = (opts, value) => opts.find((opt) => opt.value === value) || null;

  const handleParticularChange = () => {
    const newVal = !formData.particular;
    setFormData((p) => ({
      ...p,
      particular: newVal,
      ...(newVal ? { id_seguro: null, nombre_seguro: "" } : {}),
    }));
  };

  const formatDoctorOption = ({ label, tipo }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{label}</span>
      <span style={{ 
        fontSize: '0.7rem', backgroundColor: '#f3f4f6', padding: '2px 8px', 
        borderRadius: '4px', color: '#666', fontWeight: 'bold' 
      }}>
        {tipo}
      </span>
    </div>
  );

  const profSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "12px",
      borderColor: state.isFocused ? "#ec3137" : "#e2e8f0",
      minHeight: "48px",
      backgroundColor: state.isDisabled ? "#f1f5f9" : "#fff",
      boxShadow: "none",
      transition: "all 0.3s ease",
      "&:hover": { borderColor: "#ec3137" },
    }),
    placeholder: (base) => ({ ...base, fontSize: "0.9rem", color: "#a0aec0" }),
    menu: (base) => ({ ...base, zIndex: 9999, borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.85rem",
      backgroundColor: state.isSelected ? "#ec3137" : state.isFocused ? "#fff5f5" : "transparent",
      color: state.isSelected ? "#fff" : "#334155",
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

        {/* PACIENTE */}
        <div className="prof-field-group">
          <label className="prof-label">
            <UserCircle size={18} className="prof-icon" /> PACIENTE *
          </label>
          <Select
            isClearable
            options={options.pacientes}
            value={selectValue(options.pacientes, formData.id_paciente)}
            onChange={(opt) => setFormData((p) => ({
              ...p,
              id_paciente: opt?.value || "",
              nombre_paciente: opt?.label || "",
            }))}
            placeholder="BUSCAR PACIENTE..."
            styles={profSelectStyles}
          />
        </div>

        {/* --- NUEVA SECCIÓN: MÉDICO --- */}
        <div className="prof-field-group" style={{ marginTop: "20px" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label className="prof-label" style={{ margin: 0 }}>
              <Stethoscope size={18} className="prof-icon" /> MÉDICO TRATANTE
            </label>
          </div>
          <Select
            isClearable
            options={options.medicos}
            formatOptionLabel={formatDoctorOption}
            value={selectValue(options.medicos, formData.id_medico)}
            onChange={(opt) => setFormData((p) => ({
              ...p,
              id_medico: opt?.value || null,
              nombre_medico: opt?.label || "",
              tipo_medico: opt?.tipo || ""
            }))}
            placeholder="BUSCAR MÉDICO..."
            styles={profSelectStyles}
          />
        </div>

        <div className="prof-grid-layout">
          {/* SEGURO / PARTICULAR */}
          <div className="prof-field-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label className="prof-label" style={{ margin: 0 }}>
                <ShieldCheck size={18} className="prof-icon" /> SEGURO
              </label>
              <div
                onClick={handleParticularChange}
                style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700", color: formData.particular ? "#ec3137" : "#64748b" }}
              >
                {formData.particular ? <CheckSquare size={16} /> : <Square size={16} />}
                PARTICULAR
              </div>
            </div>
            <Select
              isClearable
              isDisabled={formData.particular}
              options={options.seguros}
              value={formData.particular ? null : selectValue(options.seguros, formData.id_seguro)}
              onChange={(opt) => setFormData((p) => ({
                ...p,
                id_seguro: opt?.value || null,
                nombre_seguro: opt?.label || "",
              }))}
              placeholder={formData.particular ? "N/A (PARTICULAR)" : "SELECCIONAR..."}
              styles={profSelectStyles}
            />
          </div>

          {/* CLÍNICA */}
          <div className="prof-field-group">
            <label className="prof-label">
              <Building2 size={18} className="prof-icon" /> CLÍNICA
            </label>
            <Select
              isClearable
              options={options.clinicas}
              value={selectValue(options.clinicas, formData.id_clinica)}
              onChange={(opt) => setFormData((p) => ({
                ...p,
                id_clinica: opt?.value || null,
                nombre_clinica: opt?.label || "",
              }))}
              placeholder="OPCIONAL"
              styles={profSelectStyles}
            />
          </div>
        </div>


        {/* NOTAS */}
        <div className="prof-field-group" style={{ marginTop: "20px" }}>
          <label className="prof-label">
            <FileText size={18} className="prof-icon" /> NOTAS / OBSERVACIONES
          </label>
          <textarea
            value={formData.notas}
            onChange={(e) => setFormData((p) => ({ ...p, notas: e.target.value.toUpperCase() }))}
            placeholder="OPCIONAL..."
            rows={3}
            className="prof-textarea" // Asumiendo que moverás los estilos a CSS
            style={{ width: "100%", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "12px 14px", fontSize: "0.9rem", outline: "none" }}
          />
        </div>
      </div>

      {/* Modal para crear médico nuevo */}
      <DoctorFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={async (data) => {
          await createNewMedico({ ...data, id_tipoMedico: Number(data.id_tipomedico), estatus: true });
          await getAllMedicos();
          setIsFormModalOpen(false);
        }}
        tipoMedicos={tipoMedicos}
      />
    </section>
  );
};

export default StepInfo;