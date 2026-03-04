import React, { useEffect, useMemo } from "react";
import Select from "react-select";
import { Trash2, User, Building2, ShieldCheck, UserCircle, Stethoscope, Warehouse } from "lucide-react";
import "../../../../styles/ui/stepsSales/StepInfo.css";

import { useHealth } from "../../../../context/HealtContext";
import { useSales } from "../../../../context/SalesContext";
import { useEntity } from "../../../../context/EntityContext";
import { useClinics } from "../../../../context/ClinicsContext";

const StepInfo = ({ formData, setFormData, onValidationChange }) => {
  const {
    pacientes,
    medicos,
    seguros,
    getAllPacientes,
    getAllMedicos,
    getAllSeguros
  } = useHealth();

  const { sellers, getAllSellers } = useSales();
  const { entities, getAllEntities } = useEntity();
  const { clinics, getAllClinics } = useClinics();

  const oficinas = entities?.oficinas || [];
  const depositos = entities?.depositos || [];

  /* ===================== LOAD DATA ===================== */
  useEffect(() => {
    getAllPacientes();
    getAllMedicos();
    getAllSellers();
    getAllEntities("oficinas");
    getAllEntities("depositos");
    getAllSeguros();
    getAllClinics();
  }, []);

  /* ===================== VALIDATION ===================== */
  useEffect(() => {
    const isValid =
      formData.id_paciente !== "" &&
      formData.personal_asignado?.length > 0 &&
      formData.id_vendedor !== "" &&
      formData.id_oficina !== "" &&
      formData.id_deposito !== "" &&
      formData.id_clinica !== "";

    onValidationChange?.(isValid);
  }, [formData, onValidationChange]);

  /* ===================== HELPERS ===================== */
  const buildOptions = (data, labelKey = "nombre") =>
    (data || []).map((item) => ({
      ...item, // Mantenemos todas las propiedades originales (id_deposito, etc)
      value: item.id,
      label: item[labelKey]?.toUpperCase(),
      tipo: item.tipo?.toUpperCase() || "MÉDICO GENERAL"
    }));

  const selectValue = (options, value) =>
    options.find((opt) => opt.value === value) || null;

  /* ===================== OPTIONS ===================== */
  const pacienteOptions = useMemo(() => buildOptions(pacientes), [pacientes]);
  const medicoOptions = useMemo(() => buildOptions(medicos), [medicos]);
  const sellerOptions = useMemo(() => buildOptions(sellers), [sellers]);
  const insuranceOptions = useMemo(() => buildOptions(seguros), [seguros]);
  const clinicOptions = useMemo(() => buildOptions(clinics), [clinics]);
  const officeOptions = useMemo(() => buildOptions(oficinas), [oficinas]);

  /* ===================== DEPOSIT LOGIC ===================== */
  // Si la oficina seleccionada tiene un id_deposito, filtramos o priorizamos ese.
  const depositOptions = useMemo(() => {
    const allDeposits = buildOptions(depositos);
    if (!formData.id_oficina) return [];

    // Buscamos la oficina actual para ver su depósito sugerido
    const currentOffice = oficinas.find(o => o.id === formData.id_oficina);
    
    // Si la oficina tiene un depósito asignado en su esquema, podrías filtrar por nombre o ID 
    // Aquí filtramos los depósitos cuyo nombre coincida con el nombre_deposito de la oficina
    if (currentOffice?.nombre_deposito) {
      return allDeposits.filter(d => 
        d.nombre.toUpperCase() === currentOffice.nombre_deposito.toUpperCase() ||
        d.id === currentOffice.id_deposito
      );
    }

    return allDeposits;
  }, [depositos, oficinas, formData.id_oficina]);

  /* ===================== HANDLERS ===================== */
  const handleClinicChange = (opt) => {
    if (!opt) {
      setFormData((prev) => ({
        ...prev,
        id_clinica: "", nombre_clinica: "",
        id_oficina: "", nombre_oficina: "",
        id_deposito: "", nombre_deposito: ""
      }));
      return;
    }

    const rawClinic = clinics.find((c) => c.id === opt.value);
    const relatedOffice = oficinas.find((o) => o.id === rawClinic?.id_oficina);

    setFormData((prev) => ({
      ...prev,
      id_clinica: opt.value,
      nombre_clinica: opt.label,
      id_oficina: relatedOffice?.id || "",
      nombre_oficina: relatedOffice?.nombre?.toUpperCase() || "",
      // Si la oficina ya trae un depósito por defecto, lo asignamos de una vez
      id_deposito: relatedOffice?.id_deposito || "",
      nombre_deposito: relatedOffice?.nombre_deposito?.toUpperCase() || ""
    }));
  };

  const handleOfficeChange = (opt) => {
    if (!opt) {
      setFormData(p => ({ ...p, id_oficina: "", nombre_oficina: "", id_deposito: "", nombre_deposito: "" }));
      return;
    }

    setFormData((p) => ({
      ...p,
      id_oficina: opt.value,
      nombre_oficina: opt.label,
      // Al cambiar oficina, seteamos el depósito que esa oficina tiene vinculado
      id_deposito: opt.id_deposito || "",
      nombre_deposito: opt.nombre_deposito?.toUpperCase() || ""
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
      borderRadius: "10px",
      borderColor: state.isFocused ? "#ec3137" : "#e2e8f0",
      minHeight: "48px",
      boxShadow: "none",
      "&:hover": { borderColor: "#ec3137" }
    }),
    placeholder: (base) => ({ ...base, fontSize: "0.9rem", color: "#a0aec0" }),
    menu: (base) => ({ ...base, zIndex: 9999, borderRadius: "10px", overflow: "hidden" })
  };

  return (
    <section className="si-container">
      <div className="si-header">
        <div className="si-header-content">
          <h3 className="si-title">Información de la Operación</h3>
          <p className="si-subtitle">Gestión de ubicación, paciente y logística de inventario.</p>
        </div>
      </div>

      <div className="si-grid">
        <div className="si-column si-col-main">
          {/* CLINICA */}
          <div className="si-field-group">
            <label className="si-label"><Building2 size={16} /> Clínica / Institución *</label>
            <Select
              options={clinicOptions}
              value={selectValue(clinicOptions, formData.id_clinica)}
              onChange={handleClinicChange}
              placeholder="¿Dónde se realiza el servicio?"
              styles={siSelectStyles}
              isClearable
            />
          </div>

          {/* OFICINA + DEPÓSITO */}
          <div className="si-row-compact">
            <div className="si-field-group">
              <label className="si-label">Oficina *</label>
              <Select
                options={officeOptions}
                value={selectValue(officeOptions, formData.id_oficina)}
                onChange={handleOfficeChange}
                placeholder="Seleccionar oficina..."
                styles={siSelectStyles}
              />
            </div>

            <div className="si-field-group">
              <label className="si-label"><Warehouse size={16} /> Depósito de Salida *</label>
              <Select
                options={depositOptions}
                value={selectValue(depositOptions, formData.id_deposito)}
                onChange={(opt) => setFormData(p => ({
                  ...p,
                  id_deposito: opt?.value || "",
                  nombre_deposito: opt?.label || ""
                }))}
                placeholder="Depósito..."
                noOptionsMessage={() => "No hay depósitos para esta oficina"}
                styles={siSelectStyles}
                isDisabled={!formData.id_oficina}
              />
            </div>
          </div>

          <div className="si-row-compact">
            <div className="si-field-group">
              <label className="si-label">Vendedor *</label>
              <Select
                options={sellerOptions}
                value={selectValue(sellerOptions, formData.id_vendedor)}
                onChange={(opt) => setFormData(p => ({
                  ...p,
                  id_vendedor: opt?.value || "",
                  nombre_vendedor: opt?.label || ""
                }))}
                placeholder="Vendedor..."
                styles={siSelectStyles}
              />
            </div>
            <div className="si-field-group">
              <label className="si-label"><ShieldCheck size={16} /> Seguro (Opcional)</label>
              <Select
                options={insuranceOptions}
                value={selectValue(insuranceOptions, formData.id_seguro)}
                onChange={(opt) => setFormData(p => ({
                  ...p,
                  id_seguro: opt?.value || null,
                  nombre_seguro: opt?.label || ""
                }))}
                isClearable
                placeholder="Ninguno"
                styles={siSelectStyles}
              />
            </div>
          </div>
        </div>

        <div className="si-column si-col-side">
          <div className="si-field-group">
            <label className="si-label"><UserCircle size={16} /> Paciente *</label>
            <Select
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

          <div className="si-field-group si-personal-box">
            <label className="si-label"><Stethoscope size={16} /> Equipo Médico *</label>
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
                    <button type="button" onClick={() => setFormData(prev => ({
                      ...prev,
                      personal_asignado: prev.personal_asignado.filter(p => p.id !== med.id)
                    }))} className="si-member-remove">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="si-empty-state"><p>No hay personal asignado.</p></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepInfo;