import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { Trash2, User, Building2, ShieldCheck, UserCircle, Stethoscope, Warehouse, Plus } from "lucide-react";
import "../../../../styles/ui/stepsSales/StepInfo.css";

import { useHealth } from "../../../../context/HealtContext";
import { useSales } from "../../../../context/SalesContext";
import { useEntity } from "../../../../context/EntityContext";
import { useClinics } from "../../../../context/ClinicsContext";

// IMPORTANTE: Asegúrate de que esta ruta sea la correcta para tu proyecto
import DoctorFormModal from "../../../Patients/ui/DoctorFormModal";

const StepInfo = ({ formData, setFormData, onValidationChange }) => {
  const {
    pacientes,
    medicos,
    seguros,
    tipoMedicos,
    getAllPacientes,
    getAllMedicos,
    getAllSeguros,
    getAllTipoMedicos,
    createNewMedico,
    createNewTipoMedico
  } = useHealth();

  const { sellers, getAllSellers } = useSales();
  const { entities, getAllEntities } = useEntity();
  const { clinics, getAllClinics } = useClinics();

  console.log("formData")
  console.log(formData)

  // Estados locales para el modal de creación rápida
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const oficinas = entities?.oficinas || [];
  const depositos = entities?.depositos || [];

  useEffect(() => {
    getAllPacientes();
    getAllMedicos();
    getAllTipoMedicos();
    getAllSellers();
    getAllEntities("oficinas");
    getAllEntities("depositos");
    getAllSeguros();
    getAllClinics();
  }, []);

  // --- LÓGICA DE VALIDACIÓN ---
  useEffect(() => {
    const isValid =
      formData.id_paciente !== "" &&
      formData.id_vendedor !== "";

    onValidationChange?.(isValid);
  }, [formData.id_paciente, formData.id_vendedor, onValidationChange]);

  // --- LÓGICA DE GUARDADO (Integración con Modal) ---
  const handleSaveDoctor = async (data) => {
    try {
      const payload = {
        nombre: data.nombre,
        telefono: data.telefono,
        id_tipoMedico: Number(data.id_tipomedico),
        estatus: true
      };
      await createNewMedico(payload);
      await getAllMedicos(); // Refresca la lista de médicos tras crear uno nuevo
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error al guardar médico:", error);
    }
  };

  // --- Helpers de Opciones ---
  const buildOptions = (data, labelKey = "nombre") =>
    (data || []).map((item) => ({
      ...item,
      value: item.id,
      label: item[labelKey]?.toUpperCase(),
    }));

  const selectValue = (options, value) =>
    options.find((opt) => opt.value === value) || null;

  // --- Opciones Base ---
  const pacienteOptions = useMemo(() => buildOptions(pacientes), [pacientes]);
  const medicoOptions = useMemo(() => 
    (medicos || []).map(m => ({ 
        value: m.id, 
        label: m.nombre?.toUpperCase(), 
        tipo: m.tipo?.toUpperCase() || "MÉDICO GENERAL" 
    })), [medicos]);
  
  const insuranceOptions = useMemo(() => buildOptions(seguros), [seguros]);
  const clinicOptions = useMemo(() => buildOptions(clinics), [clinics]);
  const sellerOptions = useMemo(() => buildOptions(sellers), [sellers]);
  const allOfficeOptions = useMemo(() => buildOptions(oficinas), [oficinas]);
  const allDepositOptions = useMemo(() => buildOptions(depositos), [depositos]);

  // --- Filtrado Relacional (Cascada) ---
  const filteredOfficeOptions = useMemo(() => {
    if (!formData.id_vendedor) return []; 
    const selectedSeller = sellers.find(s => s.id === formData.id_vendedor);
    if (!selectedSeller) return [];
    
    return allOfficeOptions.filter(opt => opt.value === selectedSeller.id_oficina);
  }, [formData.id_vendedor, sellers, allOfficeOptions]);

  const filteredDepositOptions = useMemo(() => {
    if (!formData.id_oficina) return [];
    const selectedOffice = oficinas.find(o => o.id === formData.id_oficina);
    if (!selectedOffice) return [];

    return allDepositOptions.filter(opt => opt.value === selectedOffice.id_deposito);
  }, [formData.id_oficina, oficinas, allDepositOptions]);

  // --- Manejadores de Cambio ---
  const handleSellerChange = (opt) => {
    setFormData(prev => ({
      ...prev,
      id_vendedor: opt?.value || "",
      nombre_vendedor: opt?.label || "",
      id_oficina: "",
      nombre_oficina: "",
      id_deposito: "",
      nombre_deposito: ""
    }));
  };

  const handleOfficeChange = (opt) => {
    setFormData(prev => ({
      ...prev,
      id_oficina: opt?.value || "",
      nombre_oficina: opt?.label || "",
      id_deposito: "",
      nombre_deposito: ""
    }));
  };

  const handleClinicChange = (opt) => {
    if (!opt) {
      setFormData((prev) => ({
        ...prev,
        id_clinica: "", 
        nombre_clinica: "",
      }));
      return;
    }

    const rawClinic = clinics.find((c) => c.id === opt.value);
    const relatedOffice = oficinas.find((o) => o.id === rawClinic?.id_oficina);

    setFormData((prev) => ({
      ...prev,
      id_clinica: opt.value,
      nombre_clinica: opt.label,
      id_oficina: relatedOffice?.id || prev.id_oficina,
      nombre_oficina: relatedOffice?.nombre?.toUpperCase() || prev.nombre_oficina
    }));
  };

  const handleAddPersonal = (opt) => {
    if (!opt) return;
    if (!formData.personal_asignado?.some((p) => p.id === opt.value)) {
      setFormData((prev) => ({
        ...prev,
        personal_asignado: [...(prev.personal_asignado || []), { id: opt.value, nombre: opt.label, tipo: opt.tipo }]
      }));
    }
  };

  const siSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "12px",
      borderColor: state.isFocused ? "#ec3137" : "#e2e8f0",
      minHeight: "48px",
      boxShadow: "none",
      "&:hover": { borderColor: "#ec3137" }
    }),
    placeholder: (base) => ({ ...base, fontSize: "0.9rem", color: "#a0aec0" }),
    menu: (base) => ({ ...base, zIndex: 9999, borderRadius: "12px", overflow: "hidden" })
  };

  return (
    <section className="si-container">
      <div className="si-header">
        <h3 className="si-title">Información de la Operación</h3>
        <p className="si-subtitle">Complete los datos. Solo los marcados con (*) son obligatorios.</p>
      </div>

      <div className="si-grid">
        <div className="si-column">
          <div className="si-card">
            <h4 className="si-card-title">Datos Principales</h4>
            <div className="si-field-group">
              <label className="si-label"><UserCircle size={16} /> Paciente *</label>
              <Select
                isClearable
                options={pacienteOptions}
                value={selectValue(pacienteOptions, formData.id_paciente)}
                onChange={(opt) => setFormData(p => ({
                  ...p,
                  id_paciente: opt?.value || "",
                  nombre_paciente: opt?.label || ""
                }))}
                placeholder="Buscar paciente..."
                styles={siSelectStyles}
              />
            </div>

            <div className="si-field-group">
              <label className="si-label">Vendedor *</label>
              <Select
                isClearable
                options={sellerOptions}
                value={selectValue(sellerOptions, formData.id_vendedor)}
                onChange={handleSellerChange}
                placeholder="Seleccionar vendedor..."
                styles={siSelectStyles}
              />
            </div>
          </div>

          <div className="si-card si-team-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 className="si-card-title"><Stethoscope size={16} /> Equipo Médico</h4>
              <button 
                type="button" 
                className="btn-small" 
                onClick={() => setIsFormModalOpen(true)}
                style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#ec3137', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Nuevo
              </button>
            </div>
            
            <div className="si-field-group">
              <Select
                options={medicoOptions}
                value={null}
                onChange={handleAddPersonal}
                formatOptionLabel={(opt) => (
                  <div className="si-option-info">
                    <span className="si-option-label">{opt.label}</span>
                    <span className="si-option-sublabel">{opt.tipo}</span>
                  </div>
                )}
                placeholder="Asignar médicos..."
                styles={siSelectStyles}
                getOptionLabel={(option) => `${option.label} ${option.tipo}`}
              />
            </div>

            <div className="si-selected-list">
              {formData.personal_asignado?.length > 0 ? (
                formData.personal_asignado.map((med) => (
                  <div key={med.id} className="si-member-card">
                    <div className="si-member-info">
                      <div className="si-member-avatar"><User size={14} /></div>
                      <div className="si-member-text">
                        <span className="si-member-name">{med.nombre}</span>
                        <span className="si-member-type">{med.tipo}</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        personal_asignado: prev.personal_asignado.filter(p => p.id !== med.id)
                      }))} 
                      className="si-member-remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="si-empty-state"><p>No hay personal asignado aún.</p></div>
              )}
            </div>
          </div>
        </div>

        <div className="si-column">
          {/* ... resto de tu sección logística igual ... */}
          <div className="si-card">
            <h4 className="si-card-title">Logística (Opcional)</h4>
            <div className="si-row-compact">
              <div className="si-field-group">
                <label className="si-label">Oficina</label>
                <Select
                  isClearable
                  options={filteredOfficeOptions}
                  value={selectValue(allOfficeOptions, formData.id_oficina)}
                  onChange={handleOfficeChange}
                  placeholder="Oficina..."
                  styles={siSelectStyles}
                  isDisabled={!formData.id_vendedor}
                />
              </div>
              <div className="si-field-group">
                <label className="si-label"><Warehouse size={16} /> Depósito</label>
                <Select
                  isClearable
                  options={filteredDepositOptions}
                  value={selectValue(allDepositOptions, formData.id_deposito)}
                  onChange={(opt) => setFormData(p => ({
                    ...p,
                    id_deposito: opt?.value || "",
                    nombre_deposito: opt?.label || ""
                  }))}
                  placeholder="Depósito..."
                  styles={siSelectStyles}
                  isDisabled={!formData.id_oficina}
                />
              </div>
            </div>
          </div>

          <div className="si-card">
            <h4 className="si-card-title">Destino (Opcional)</h4>
            <div className="si-field-group">
              <label className="si-label"><Building2 size={16} /> Clínica / Institución</label>
              <Select
                isClearable
                options={clinicOptions}
                value={selectValue(clinicOptions, formData.id_clinica)}
                onChange={handleClinicChange}
                placeholder="¿Dónde se realiza?"
                styles={siSelectStyles}
              />
            </div>
            <div className="si-field-group" style={{ marginTop: '16px' }}>
              <label className="si-label"><ShieldCheck size={16} /> Seguro</label>
              <Select
                isClearable
                options={insuranceOptions}
                value={selectValue(insuranceOptions, formData.id_seguro)}
                onChange={(opt) => setFormData(p => ({
                  ...p,
                  id_seguro: opt?.value || null,
                  nombre_seguro: opt?.label || ""
                }))}
                placeholder="Ninguno"
                styles={siSelectStyles}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear nuevos médicos */}
      <DoctorFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveDoctor}
        tipoMedicos={tipoMedicos}
        onCreateTipoMedico={createNewTipoMedico}
      />
    </section>
  );
};

export default StepInfo;