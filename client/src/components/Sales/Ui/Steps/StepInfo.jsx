import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import {
  Trash2,
  Building2,
  UserCircle,
  Stethoscope,
  Warehouse,
  Plus,
} from "lucide-react";

import { useHealth } from "../../../../context/HealtContext";
import { useSales } from "../../../../context/SalesContext";
import { useEntity } from "../../../../context/EntityContext";
import { useClinics } from "../../../../context/ClinicsContext";
import DoctorFormModal from "../../../Patients/ui/DoctorFormModal";

import "../../../../styles/ui/stepsSales/StepInfo.css";

const StepInfo = ({ formData, setFormData, onValidationChange }) => {
  const {
    pacientes,
    medicos,
    tipoMedicos,
    getAllPacientes,
    getAllMedicos,
    getAllSeguros,
    getAllTipoMedicos,
    createNewMedico,
  } = useHealth();

  const { sellers, getAllSellers } = useSales();
  const { entities, getAllEntities } = useEntity();
  const { clinics, getAllClinics } = useClinics();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        getAllPacientes(),
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

  const options = useMemo(
    () => ({
      pacientes: (pacientes || []).map((p) => ({
        value: p.id,
        label: p.nombre?.toUpperCase(),
      })),
      sellers: (sellers || []).map((s) => ({
        value: s.id,
        label: s.nombre?.toUpperCase(),
        id_oficina: s.id_oficina,
      })),
      medicos: (medicos || []).map((m) => ({
        value: m.id,
        label: m.nombre?.toUpperCase(),
        tipo: m.tipo?.toUpperCase() || "GENERAL",
      })),
      oficinas: (entities?.oficinas || []).map((o) => ({
        value: o.id,
        label: o.nombre?.toUpperCase(),
      })),
      depositos: (entities?.depositos || []).map((d) => ({
        value: d.id,
        label: d.nombre?.toUpperCase(),
      })),
      clinics: (clinics || []).map((c) => ({
        value: c.id,
        label: c.nombre?.toUpperCase(),
        id_oficina: c.id_oficina,
      })),
    }),
    [pacientes, sellers, medicos, entities, clinics]
  );

  const handleSellerChange = (opt) => {
    if (!opt) {
      setFormData((prev) => ({
        ...prev,
        id_vendedor: "",
        nombre_vendedor: "",
        id_oficina: "",
        nombre_oficina: "",
        id_deposito: "",
        nombre_deposito: "",
      }));
      return;
    }

    const oficinaSeleccionada = entities?.oficinas?.find(
      (o) => o.id === opt.id_oficina
    );

    const depositoSugerido = entities?.depositos?.find((d) => 
      oficinaSeleccionada && 
      d.nombre.toLowerCase().includes(oficinaSeleccionada.nombre.split(' ')[0].toLowerCase())
    );

    setFormData((prev) => ({
      ...prev,
      id_vendedor: opt.value,
      nombre_vendedor: opt.label,
      id_oficina: oficinaSeleccionada?.id || "",
      nombre_oficina: oficinaSeleccionada?.nombre || "",
      id_deposito: depositoSugerido?.id || prev.id_deposito,
      nombre_deposito: depositoSugerido?.nombre || prev.nombre_deposito,
    }));
  };

  const handleClinicChange = (opt) => {
    const oficinaRelacionada = options.oficinas.find(
      (o) => o.value === opt?.id_oficina
    );
    setFormData((prev) => ({
      ...prev,
      id_clinica: opt?.value || "",
      nombre_clinica: opt?.label || "",
      id_oficina: oficinaRelacionada?.value || prev.id_oficina,
      nombre_oficina: oficinaRelacionada?.label || prev.nombre_oficina,
    }));
  };

  const siSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "8px",
      borderColor: state.isFocused ? "#ec3137" : "#ddd",
      minHeight: "45px",
      fontSize: "0.95rem",
      boxShadow: "none",
      transition: "all 0.2s",
      "&:hover": { borderColor: "#ec3137" },
    }),
    menu: (base) => ({ ...base, zIndex: 9999, borderRadius: "8px" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#ec3137"
        : state.isFocused
        ? "#fff5f5"
        : "transparent",
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
        <div className="pform-group col-span-2">
          <label>
            <UserCircle size={14} /> PACIENTE{" "}
            <span className="required">*</span>
          </label>
          <Select
            isClearable
            options={options.pacientes}
            value={
              options.pacientes.find((o) => o.value === formData.id_paciente) ||
              null
            }
            onChange={(opt) =>
              setFormData((p) => ({
                ...p,
                id_paciente: opt?.value || "",
                nombre_paciente: opt?.label || "",
              }))
            }
            placeholder="Seleccionar paciente..."
            styles={siSelectStyles}
          />
        </div>

        <div className="pform-group col-span-2">
          <label>
            VENDEDOR <span className="required">*</span>
          </label>
          <Select
            isClearable
            options={options.sellers}
            value={
              options.sellers.find((o) => o.value === formData.id_vendedor) ||
              null
            }
            onChange={handleSellerChange}
            placeholder="Asignar vendedor..."
            styles={siSelectStyles}
          />
        </div>

        <div className="pform-group col-span-2">
          <label>OFICINA ( OPCIONAL ) </label>
          <Select
            isClearable
            options={options.oficinas}
            value={
              options.oficinas.find((o) => o.value === formData.id_oficina) ||
              null
            }
            onChange={(opt) =>
              setFormData((p) => ({
                ...p,
                id_oficina: opt?.value || "",
                nombre_oficina: opt?.label || "",
              }))
            }
            styles={siSelectStyles}
            placeholder="Oficina..."
          />
        </div>

        <div className="pform-group col-span-2">
          <label>
            <Warehouse size={14} /> DEPÓSITO ( OPCIONAL )
          </label>
          <Select
            isClearable
            options={options.depositos}
            value={
              options.depositos.find((o) => o.value === formData.id_deposito) ||
              null
            }
            onChange={(opt) =>
              setFormData((p) => ({
                ...p,
                id_deposito: opt?.value || "",
                nombre_deposito: opt?.label || "",
              }))
            }
            styles={siSelectStyles}
            placeholder="Depósito..."
          />
        </div>

        <div className="pform-group col-span-2">
          <label>
            <Building2 size={14} /> CLÍNICA / DESTINO ( OPCIONAL )
          </label>
          <Select
            isClearable
            options={options.clinics}
            value={
              options.clinics.find((o) => o.value === formData.id_clinica) ||
              null
            }
            onChange={handleClinicChange}
            styles={siSelectStyles}
            placeholder="Seleccionar institución..."
          />
        </div>

        <div className="pform-group col-span-2">
          <div className="si-label-row">
            <label>
              <Stethoscope size={14} /> EQUIPO MÉDICO ASIGNADO ( OPCIONAL )
            </label>
            <button
              type="button"
              className="si-btn-add-inline"
              onClick={() => setIsFormModalOpen(true)}
            >
              <Plus size={14} /> Nuevo Médico
            </button>
          </div>

          <Select
            options={options.medicos}
            value={null}
            onChange={(opt) => {
              if (
                opt &&
                !formData.personal_asignado?.some((p) => p.id === opt.value)
              ) {
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
                    type="button"
                    className="si-item-delete"
                    title="Quitar"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        personal_asignado: prev.personal_asignado.filter(
                          (p) => p.id !== med.id
                        ),
                      }))
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <span className="si-empty-text">
                No hay médicos asignados a esta operación.
              </span>
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
    </div>
  );
};

export default StepInfo;