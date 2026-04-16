import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { 
  UserCircle, 
  Stethoscope, 
  Plus, 
  Trash2,
  Building2 
} from "lucide-react";

import { useHealth } from "../../../../context/HealtContext";
import { useClinics } from "../../../../context/ClinicsContext";
import DoctorFormModal from "../../../Patients/ui/DoctorFormModal";

import "../../../../styles/ui/stepsBudgets/StepInfo.css";

const StepInfo = ({ formData, setFormData, onValidationChange }) => {
  const { 
    pacientes, 
    medicos, 
    tipoMedicos, 
    getAllPacientes, 
    getAllMedicos, 
    getAllTipoMedicos,
    createNewMedico 
  } = useHealth();

  const { clinics, getAllClinics } = useClinics();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        getAllPacientes(),
        getAllMedicos(),
        getAllTipoMedicos(),
        getAllClinics(),
      ]);
    };
    fetchData();
  }, []);

  // Validación: Paciente y Clínica son requeridos
  useEffect(() => {
    const isValid = !!formData.id_paciente && !!formData.id_clinica;
    onValidationChange?.(isValid);
  }, [formData.id_paciente, formData.id_clinica, onValidationChange]);

  const options = useMemo(() => ({
    pacientes: (pacientes || []).map((p) => ({
      value: p.id,
      label: p.nombre?.toUpperCase(),
      cedula: p.cedula || p.documento || "", // Captura del documento
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
  }), [pacientes, medicos, clinics]);

  const formatDoctorOption = ({ label, tipo }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{label}</span>
      <span style={{ 
        fontSize: '0.7rem', 
        backgroundColor: '#f3f4f6', 
        padding: '2px 8px', 
        borderRadius: '4px',
        color: '#666',
        fontWeight: 'bold'
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
      backgroundColor: "#fff",
      boxShadow: "none",
      transition: "all 0.3s ease",
      "&:hover": { borderColor: "#ec3137" }
    }),
    placeholder: (base) => ({ ...base, fontSize: "0.9rem", color: "#a0aec0" }),
    menu: (base) => ({ 
      ...base, 
      zIndex: 9999, 
      borderRadius: "12px", 
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)" 
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
        <h3 className="prof-title">Información del Reporte</h3>
        <p className="prof-subtitle">Defina el paciente, la clínica y el personal médico asignado.</p>
      </div>

      <div className="prof-main-card">
        <h4 className="prof-card-tag">Datos Principales</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* SECCIÓN PACIENTE */}
          <div className="prof-field-group">
            <label className="prof-label">
              <UserCircle size={18} className="prof-icon" /> PACIENTE *
            </label>
            <Select
              isClearable
              options={options.pacientes}
              value={options.pacientes.find(o => o.value === formData.id_paciente) || null}
              onChange={(opt) => setFormData(p => ({
                ...p,
                id_paciente: opt?.value || "",
                nombre_paciente: opt?.label || "",
                documento_paciente: opt?.cedula || "" // Carga silenciosa del documento
              }))}
              placeholder="BUSCAR PACIENTE..."
              styles={profSelectStyles}
            />
          </div>

          {/* SECCIÓN CLÍNICA */}
          <div className="prof-field-group">
            <label className="prof-label">
              <Building2 size={18} className="prof-icon" /> CLÍNICA *
            </label>
            <Select
              isClearable
              options={options.clinicas}
              value={options.clinicas.find(o => o.value === formData.id_clinica) || null}
              onChange={(opt) => setFormData(p => ({
                ...p,
                id_clinica: opt?.value || "",
                nombre_clinica: opt?.label || ""
              }))}
              placeholder="SELECCIONAR CLÍNICA..."
              styles={profSelectStyles}
            />
          </div>
        </div>

        {/* SECCIÓN PERSONAL MÉDICO */}
        <div className="prof-field-group" style={{ marginTop: '1.5rem' }}>
          <div className="si-label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label className="prof-label" style={{ marginBottom: 0 }}>
              <Stethoscope size={18} className="prof-icon" /> EQUIPO MÉDICO ASIGNADO
            </label>
            <button
              type="button"
              className="si-btn-add-inline"
              onClick={() => setIsFormModalOpen(true)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '4px', 
                fontSize: '0.8rem', color: '#ec3137', border: 'none', 
                background: 'none', cursor: 'pointer', fontWeight: '600' 
              }}
            >
              <Plus size={14} /> Nuevo Médico
            </button>
          </div>

          <Select
            options={options.medicos}
            value={null} 
            formatOptionLabel={formatDoctorOption}
            onChange={(opt) => {
              if (opt && !formData.personal_asignado?.some((p) => p.id === opt.value)) {
                setFormData((prev) => ({
                  ...prev,
                  personal_asignado: [
                    ...(prev.personal_asignado || []),
                    { id: opt.value, nombre: opt.label, tipo: opt.tipo },
                  ],
                }));
              }
            }}
            placeholder="Escribe para buscar y agregar médicos..."
            styles={profSelectStyles}
          />

          <div className="si-linear-list" style={{ marginTop: '1rem' }}>
            {formData.personal_asignado?.length > 0 ? (
              formData.personal_asignado.map((med) => (
                <div key={med.id} className="si-linear-item" 
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 15px', backgroundColor: '#f8fafc', borderRadius: '10px',
                    marginBottom: '8px', border: '1px solid #edf2f7'
                  }}>
                  <div className="si-item-info">
                    <span className="si-item-name" style={{ fontWeight: '600', fontSize: '0.9rem', marginRight: '10px' }}>
                      {med.nombre}
                    </span>
                    <span className="si-item-badge" style={{ 
                      fontSize: '0.7rem', 
                      color: '#ffffff', 
                      textTransform: 'uppercase',
                      backgroundColor: '#64748b',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {med.tipo}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({
                      ...prev,
                      personal_asignado: prev.personal_asignado.filter((p) => p.id !== med.id),
                    }))}
                    style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>
                No hay médicos asignados.
              </p>
            )}
          </div>
        </div>
      </div>

      <DoctorFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={async (data) => {
          await createNewMedico({
            ...data,
            id_tipoMedico: Number(data.id_tipomedico),
            estatus: true,
          });
          await getAllMedicos();
          setIsFormModalOpen(false);
        }}
        tipoMedicos={tipoMedicos}
      />
    </section>
  );
};

export default StepInfo;