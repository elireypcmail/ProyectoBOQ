import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import {
  Trash2,
  Building2,
  UserCircle,
  Stethoscope,
  Warehouse,
  Plus,
  Fingerprint,
  ShieldCheck,
  CheckSquare,
  Square
} from "lucide-react";

import { useHealth } from "../../../../context/HealtContext";
import { useSales } from "../../../../context/SalesContext";
import { useEntity } from "../../../../context/EntityContext";
import { useClinics } from "../../../../context/ClinicsContext";
import { useProducts } from "../../../../context/ProductsContext";
import DoctorFormModal from "../../../Patients/ui/DoctorFormModal";

import "../../../../styles/ui/stepsSales/StepInfo.css";

const StepInfo = ({ formData, setFormData, onValidationChange }) => {
  const {
    pacientes,
    medicos,
    tipoMedicos,
    seguros,
    getAllPacientes,
    getAllMedicos,
    getAllSeguros,
    getAllTipoMedicos,
    createNewMedico,
  } = useHealth();

  const { getAllDeposits } = useProducts();
  const { sellers, getAllSellers } = useSales();
  const { entities, getAllEntities } = useEntity();
  const { clinics, getAllClinics } = useClinics();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        getAllPacientes(),
        getAllDeposits(),
        getAllMedicos(),
        getAllTipoMedicos(),
        getAllSellers(),
        getAllEntities("oficinas"),
        getAllEntities("depositos"),
        getAllSeguros(),
        getAllClinics(),
      ]);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const isValid = !!(formData.id_paciente && formData.id_vendedor);
    onValidationChange?.(isValid);
  }, [formData.id_paciente, formData.id_vendedor, onValidationChange]);

  const selectedSellerData = useMemo(() => {
    return sellers?.find(s => s.id === formData.id_vendedor);
  }, [sellers, formData.id_vendedor]);

  const options = useMemo(
    () => ({
      pacientes: (pacientes || []).map((p) => ({
        value: p.id,
        label: p.nombre?.toUpperCase(),
        documento: p.documento || p.cedula || "S/D",
      })),
      seguros: (seguros || []).map((s) => ({
        value: s.id,
        label: s.nombre?.toUpperCase(),
      })),
      sellers: (sellers || []).map((s) => ({
        value: s.id,
        label: s.nombre?.toUpperCase(),
        id_oficina: s.id_oficina,
        zona: s.zona,
      })),
      medicos: (medicos || []).map((m) => ({
        value: m.id,
        label: m.nombre?.toUpperCase(),
        tipo: m.tipo?.toUpperCase() || "GENERAL",
      })),
      oficinas: (entities?.oficinas || [])
        .filter(o => !formData.id_vendedor || o.id === selectedSellerData?.id_oficina)
        .map((o) => ({
          value: o.id,
          label: o.nombre?.toUpperCase(),
        })),
      depositos: (entities?.depositos || [])
        .filter(d => {
          if (!formData.id_vendedor || !selectedSellerData?.zona) return true;
          return d.nombre.toLowerCase().includes(selectedSellerData.zona.toLowerCase());
        })
        .map((d) => ({
          value: d.id,
          label: d.nombre?.toUpperCase(),
        })),
      clinics: (clinics || []).map((c) => ({
        value: c.id,
        label: c.nombre?.toUpperCase(),
        id_oficina: c.id_oficina,
      })),
    }),
    [pacientes, seguros, sellers, medicos, entities, clinics, formData.id_vendedor, selectedSellerData]
  );

  const handlePatientChange = (opt) => {
    setFormData((p) => ({
      ...p,
      id_paciente: opt?.value || "",
      nombre_paciente: opt?.label || "",
      documento_paciente: opt?.documento || "",
    }));
  };

  const handleParticularChange = () => {
    const newVal = !formData.particular;
    setFormData((p) => ({
      ...p,
      particular: newVal,
      ...(newVal ? { id_seguro: null, nombre_seguro: "" } : {}),
    }));
  };

  const handleSellerChange = (opt) => {
    if (!opt) {
      setFormData((prev) => ({
        ...prev,
        id_vendedor: "", nombre_vendedor: "",
        id_oficina: "", nombre_oficina: "",
        id_deposito: "", nombre_deposito: "",
      }));
      return;
    }
    const oficinaSeleccionada = entities?.oficinas?.find(o => o.id === opt.id_oficina);
    const depositoSugerido = entities?.depositos?.find(d => opt.zona && d.nombre.toLowerCase().includes(opt.zona.toLowerCase()));

    setFormData((prev) => ({
      ...prev,
      id_vendedor: opt.value,
      nombre_vendedor: opt.label,
      id_oficina: oficinaSeleccionada?.id || "",
      nombre_oficina: oficinaSeleccionada?.nombre || "",
      id_deposito: depositoSugerido?.id || "",
      nombre_deposito: depositoSugerido?.nombre || "",
    }));
  };

  const handleClinicChange = (opt) => {
    if (!opt) {
      setFormData(prev => ({ ...prev, id_clinica: "", nombre_clinica: "" }));
      return;
    }
    const oficinaRelacionada = (entities?.oficinas || []).find(o => o.id === opt?.id_oficina);
    setFormData((prev) => ({
      ...prev,
      id_clinica: opt.value,
      nombre_clinica: opt.label,
      id_oficina: oficinaRelacionada?.id || prev.id_oficina,
      nombre_oficina: oficinaRelacionada?.nombre || prev.nombre_oficina,
    }));
  };

  const siSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "8px",
      borderColor: state.isFocused ? "#ec3137" : "#ddd",
      minHeight: "45px",
      fontSize: "0.95rem",
      backgroundColor: state.isDisabled ? "#f1f5f9" : "#fff",
      boxShadow: "none",
      transition: "all 0.2s",
      "&:hover": { borderColor: "#ec3137" },
    }),
    menu: (base) => ({ ...base, zIndex: 9999, borderRadius: "8px" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#ec3137" : state.isFocused ? "#fff5f5" : "transparent",
      color: state.isSelected ? "#fff" : "#333",
      "&:active": { backgroundColor: "#ec3137" },
    }),
  };

  return (
    <div className="pform-section-white si-fade-in">
      <div className="section-header">
        <h3>Información de la Operación</h3>
        <p>Define los actores principales y el destino de la logística.</p>
      </div>

      <div className="pform-form-grid">
        {/* CLIENTE */}
        <div className="pform-group col-span-2">
          <label><UserCircle size={14} /> CLIENTE O PACIENTE <span className="required">*</span></label>
          <Select
            isClearable
            options={options.pacientes}
            value={options.pacientes.find((o) => o.value === formData.id_paciente) || null}
            onChange={handlePatientChange}
            placeholder="Seleccionar paciente..."
            styles={siSelectStyles}
          />
          {formData.documento_paciente && (
            <div className="si-document-hint" style={{ marginTop: '5px', fontSize: '0.8rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Fingerprint size={12} /> <span className="bold">Documento:</span> {formData.documento_paciente}
            </div>
          )}
        </div>

        {/* VENDEDOR */}
        <div className="pform-group col-span-2">
          <label>VENDEDOR <span className="required">*</span></label>
          <Select
            isClearable
            options={options.sellers}
            value={options.sellers.find((o) => o.value === formData.id_vendedor) || null}
            onChange={handleSellerChange}
            placeholder="Asignar vendedor..."
            styles={siSelectStyles}
          />
        </div>

        {/* OFICINA */}
        <div className="pform-group col-span-2">
          <label>OFICINA ( OPCIONAL ) </label>
          <Select
            isClearable
            options={options.oficinas}
            value={options.oficinas.find((o) => o.value === formData.id_oficina) || null}
            onChange={(opt) =>
              setFormData((p) => ({
                ...p,
                id_oficina: opt?.value || "",
                nombre_oficina: opt?.label || "",
              }))
            }
            styles={siSelectStyles}
            placeholder={formData.id_vendedor ? "Oficina seleccionada..." : "Selecciona un vendedor..."}
          />
        </div>

        {/* DEPÓSITO */}
        <div className="pform-group col-span-2">
          <label><Warehouse size={14} /> DEPÓSITO ( OPCIONAL )</label>
          <Select
            isClearable
            options={options.depositos}
            value={options.depositos.find((o) => o.value === formData.id_deposito) || null}
            onChange={(opt) =>
              setFormData((p) => ({
                ...p,
                id_deposito: opt?.value || "",
                nombre_deposito: opt?.label || "",
              }))
            }
            styles={siSelectStyles}
            placeholder="Seleccionar depósito..."
          />
        </div>

        {/* CLÍNICA */}
        <div className="pform-group col-span-2">
          <label><Building2 size={14} /> CLÍNICA / DESTINO ( OPCIONAL )</label>
          <Select
            isClearable
            options={options.clinics}
            value={options.clinics.find((o) => o.value === formData.id_clinica) || null}
            onChange={handleClinicChange}
            styles={siSelectStyles}
            placeholder="Seleccionar institución..."
          />
        </div>

        {/* SEGURO CON CHECKBOX AL LADO */}
        <div className="pform-group col-span-2">
          <label><ShieldCheck size={14} /> SEGURO ( OPCIONAL )</label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <Select
                isClearable
                isDisabled={formData.particular}
                options={options.seguros}
                value={formData.particular ? null : options.seguros.find((o) => o.value === formData.id_seguro) || null}
                onChange={(opt) =>
                  setFormData((p) => ({
                    ...p,
                    id_seguro: opt?.value || null,
                    nombre_seguro: opt?.label || "",
                  }))
                }
                placeholder={formData.particular ? "N/A (PARTICULAR)" : "Seleccionar seguro..."}
                styles={siSelectStyles}
              />
            </div>
            
            <div
              onClick={handleParticularChange}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 12px",
                height: "45px",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: formData.particular ? "#ec3137" : "#ddd",
                backgroundColor: formData.particular ? "#fff5f5" : "transparent",
                cursor: "pointer",
                minWidth: "90px",
                transition: "all 0.2s ease"
              }}
            >
              {formData.particular ? <CheckSquare size={16} color="#ec3137" /> : <Square size={16} color="#64748b" />}
              <span style={{ 
                fontSize: "0.65rem", 
                fontWeight: "800", 
                marginTop: "2px",
                color: formData.particular ? "#ec3137" : "#64748b" 
              }}>PARTICULAR</span>
            </div>
          </div>
        </div>

        {/* EQUIPO MÉDICO */}
        <div className="pform-group col-span-2">
          <div className="si-label-row">
            <label><Stethoscope size={14} /> EQUIPO MÉDICO ASIGNADO ( OPCIONAL )</label>
            <button
              type="button" className="si-btn-add-inline"
              onClick={() => setIsFormModalOpen(true)}
            ><Plus size={14} /> Nuevo Médico</button>
          </div>
          <Select
            options={options.medicos}
            value={null}
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
            placeholder="Buscar y agregar médicos..."
            styles={siSelectStyles}
          />
          <div className="si-linear-list">
            {formData.personal_asignado?.length > 0 ? (
              formData.personal_asignado.map((med) => (
                <div key={med.id} className="si-linear-item">
                  <div className="si-item-info">
                    <span className="si-item-name">{med.nombre}</span>
                    <span className="si-item-badge">{med.tipo}</span>
                  </div>
                  <button
                    type="button" className="si-item-delete"
                    onClick={() => setFormData((prev) => ({
                        ...prev,
                        personal_asignado: prev.personal_asignado.filter((p) => p.id !== med.id),
                    }))}
                  ><Trash2 size={16} /></button>
                </div>
              ))
            ) : <span className="si-empty-text">No hay médicos asignados.</span>}
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default StepInfo;