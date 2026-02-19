import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { useHealth } from "../../context/HealtContext";
import {
  Search,
  Save,
  AlertTriangle,
  Plus,
  Trash2,
  Pencil,
  FileText,
  X
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Importar PhoneInput
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import ListStories from "./ListStories";
import "../../styles/components/ListPatients.css";

const ListPatients = () => {
  const {
    pacientes,
    seguros,
    getAllPacientes,
    getAllMedicos,
    getAllSeguros,
    createNewPaciente,
    editedPaciente,
    createNewSeguro,
    deletePacienteById
  } = useHealth();

  const [searchTerm, setSearchTerm] = useState("");

  // ---------------- MODALES ----------------
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateSeguroModalOpen, setIsCreateSeguroModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStoriesModalOpen, setIsStoriesModalOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // ---------------- FORMULARIOS PACIENTE ----------------
  const [nombre, setNombre] = useState("");
  const [documentoField, setDocumentoField] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [idSeguro, setIdSeguro] = useState("");

  // ---------------- FORMULARIO SEGURO ----------------
  const [nuevoSeguroNombre, setNuevoSeguroNombre] = useState("");
  const [nuevoSeguroContacto, setNuevoSeguroContacto] = useState("");
  const [nuevoSeguroTelefono, setNuevoSeguroTelefono] = useState("");

  useEffect(() => {
    getAllPacientes();
    getAllMedicos();
    getAllSeguros();
  }, []);

  const seguroOptions = useMemo(() => {
    return seguros.map(s => ({ value: s.id, label: s.nombre }));
  }, [seguros]);

  const currentSeguroValue = useMemo(() => {
    return seguroOptions.find(opt => opt.value === idSeguro) || null;
  }, [idSeguro, seguroOptions]);

  const filteredPacientes = useMemo(() => {
    return pacientes.filter(p =>
      p.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [pacientes, searchTerm]);

  const handleNameInput = (value, setter) => {
    setter(value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase());
  };

  const handleDocumentInput = (value) => {
    const upperValue = value.toUpperCase();
    const cleanValue = upperValue.replace(/[^A-Z0-9]/g, "");
    if (!cleanValue) { setDocumentoField(""); return; }
    const firstChar = cleanValue.charAt(0);
    const rest = cleanValue.slice(1);
    if (!/^[A-Z]$/.test(firstChar)) return; 
    const numbersOnly = rest.replace(/[^0-9]/g, "").slice(0, 10);
    const formatted = numbersOnly.length > 0 ? `${firstChar}-${numbersOnly}` : firstChar;
    setDocumentoField(formatted);
  };

  const resetForm = () => {
    setNombre("");
    setDocumentoField("");
    setTelefono("");
    setEmail("");
    setIdSeguro("");
    setSelectedPaciente(null);
    setIsEditing(false);
  };

  const handleSavePaciente = async () => {
    if (!nombre || !documentoField) return alert("Nombre y documento son obligatorios");
    if (documentoField.length < 3) return alert("Formato inválido (Ej: V-123456)");

    const payload = {
      nombre,
      documento: documentoField,
      telefono,
      email: email.toLowerCase().trim(),
      id_seguro: idSeguro || null,
      estatus: true
    };

    if (isEditing && selectedPaciente) {
      await editedPaciente(selectedPaciente.id, payload);
    } else {
      const res = await createNewPaciente(payload);
      if (res?.data) {
        setSelectedPaciente(res.data);
        setIsDetailsModalOpen(true);
      }
    }
    resetForm();
    setIsCreateModalOpen(false);
    getAllPacientes();
  };

  const handleCreateSeguro = async () => {
    if (!nuevoSeguroNombre || !nuevoSeguroTelefono) return;
    await createNewSeguro({
      nombre: nuevoSeguroNombre.toUpperCase(),
      contacto: nuevoSeguroContacto.toUpperCase(),
      telefono: nuevoSeguroTelefono,
      estatus: true
    });
    setNuevoSeguroNombre("");
    setNuevoSeguroContacto("");
    setNuevoSeguroTelefono("");
    setIsCreateSeguroModalOpen(false);
    getAllSeguros();
  };

  const handleDeletePaciente = async () => {
    if (!selectedPaciente) return;
    await deletePacienteById(selectedPaciente.id);
    setIsDeleteModalOpen(false);
    setSelectedPaciente(null);
    getAllPacientes();
  };

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "10px",
      borderColor: "#e2e8f0",
      minHeight: "45px",
      boxShadow: "none",
      "&:hover": { borderColor: "#cbd5e1" }
    }),
    menu: (base) => ({ ...base, borderRadius: "10px", zIndex: 9999 })
  };

  return (
    <div className="lp-container">
      {/* HEADER */}
      <div className="lp-header">
        <div>
          <h2>Pacientes</h2>
          <p>Total: {filteredPacientes.length}</p>
        </div>
        <button className="lp-btn-primary" onClick={() => { resetForm(); setIsCreateModalOpen(true); }}>
          <Plus size={16} /> Nuevo Paciente
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="lp-toolbar">
        <div className="lp-search-box">
          <Search size={16} />
          <input
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      {/* TABLA ESTILO LISTA */}
      <div className="lp-table-wrapper" style={{ border: 'none' }}>
        <table className="lp-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Paciente</th>
              <th className="lp-hide-mobile">Info Adicional</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPacientes.map(p => (
              <tr key={p.id} className="lp-list-row">
                <td className="lp-col-id">#{p.id}</td>
                <td className="lp-col-main">
                  <span className="lp-patient-name">{p.nombre}</span>
                  <span className="lp-patient-subtext">{p.documento}</span>
                </td>
                <td className="lp-col-info lp-hide-mobile">
                  <div className="lp-info-group">
                    <span className="lp-info-label">Seguro Médico</span>
                    <span className="lp-info-value">
                      {seguros.find(s => s.id === p.id_seguro)?.nombre || "Particular"}
                    </span>
                  </div>
                </td>
                <td className="lp-col-actions">
                  <button 
                    className="lp-action-pill" 
                    onClick={() => { setSelectedPaciente(p); setIsDetailsModalOpen(true); }}
                  >
                    <span className="lp-hide-mobile">Ver detalles</span>
                    <SlOptionsVertical size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPacientes.length === 0 && (
          <div className="lp-no-results">No se encontraron pacientes.</div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR (MEJORADO) */}
      {isCreateModalOpen && (
        <div className="lp-modal-overlay">
          <div className="lp-modal-content lp-modal-large">
            <div className="lp-modal-header">
              <div>
                <h3>{isEditing ? "Editar Paciente" : "Nuevo Paciente"}</h3>
                <p>Complete los datos de identidad y contacto</p>
              </div>
              <button className="lp-btn-close-icon" onClick={() => setIsCreateModalOpen(false)}><X size={20}/></button>
            </div>
            
            <div className="lp-modal-grid">
              <div className="lp-form-group">
                <label className="lp-modal-label">Nombre Completo</label>
                <input
                  className="lp-modal-input"
                  placeholder="Ej: MARÍA PÉREZ"
                  value={nombre}
                  onChange={e => handleNameInput(e.target.value, setNombre)}
                />
              </div>

              <div className="lp-form-group">
                <label className="lp-modal-label">Documento</label>
                <input
                  className="lp-modal-input"
                  placeholder="Ej: V-12345678"
                  value={documentoField}
                  onChange={(e) => handleDocumentInput(e.target.value)}
                />
              </div>

              <div className="lp-form-group">
                <label className="lp-modal-label">Teléfono</label>
                <PhoneInput
                  country={'ve'}
                  value={telefono}
                  onChange={val => setTelefono(val)}
                  inputStyle={{ width: '100%', height: '45px', borderRadius: '10px' }}
                />
              </div>

              <div className="lp-form-group">
                <label className="lp-modal-label">Email</label>
                <input
                  className="lp-modal-input"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value.replace(/\s/g, ""))}
                />
              </div>

              <div className="lp-form-group lp-col-span-2">
                <label className="lp-modal-label">Seguro Médico</label>
                <div className="lp-select-row">
                  <div style={{ flex: 1 }}>
                    <Select
                      options={seguroOptions}
                      value={currentSeguroValue}
                      onChange={(option) => setIdSeguro(option ? option.value : "")}
                      placeholder="Seleccionar seguro..."
                      isClearable
                      styles={customSelectStyles}
                    />
                  </div>
                  <button className="lp-btn-icon-add" onClick={() => setIsCreateSeguroModalOpen(true)}>
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="lp-modal-footer">
              <button className="lp-btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</button>
              <button className="lp-btn-primary lp-btn-wide" onClick={handleSavePaciente}>
                <Save size={16} /> {isEditing ? "Actualizar" : "Crear Paciente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES (MEJORADO) */}
      {isDetailsModalOpen && selectedPaciente && (
        <div className="lp-modal-overlay">
          <div className="lp-modal-content">
            <div className="lp-details-header">
              <div className="lp-avatar-circle">{selectedPaciente.nombre.charAt(0)}</div>
              <h3>{selectedPaciente.nombre}</h3>
              <span className="lp-badge-id">PACIENTE #{selectedPaciente.id}</span>
            </div>

            <div className="lp-details-grid">
              <div className="lp-detail-item">
                <span className="lp-detail-icon">🪪</span>
                <div>
                  <label>Documento</label>
                  <p>{selectedPaciente.documento}</p>
                </div>
              </div>
              <div className="lp-detail-item">
                <span className="lp-detail-icon">📞</span>
                <div>
                  <label>Teléfono</label>
                  <p>{selectedPaciente.telefono ? `+${selectedPaciente.telefono}` : "-"}</p>
                </div>
              </div>
              <div className="lp-detail-item">
                <span className="lp-detail-icon">✉️</span>
                <div>
                  <label>Email</label>
                  <p>{selectedPaciente.email || "-"}</p>
                </div>
              </div>
              <div className="lp-detail-item">
                <span className="lp-detail-icon">🏥</span>
                <div>
                  <label>Seguro</label>
                  <p>{seguros.find(s => s.id === selectedPaciente.id_seguro)?.nombre || "Particular"}</p>
                </div>
              </div>
            </div>

            <div className="lp-details-actions">
              <button className="lp-btn-action-outline" onClick={() => { setIsDetailsModalOpen(false); setIsStoriesModalOpen(true); }}>
                <FileText size={18} /> Ver Historias Clínicas
              </button>
              <div className="lp-action-row">
                <button className="lp-btn-edit-soft" onClick={() => {
                    setIsDetailsModalOpen(false);
                    setIsCreateModalOpen(true);
                    setIsEditing(true);
                    setNombre(selectedPaciente.nombre);
                    setDocumentoField(selectedPaciente.documento || "");
                    setTelefono(selectedPaciente.telefono);
                    setEmail(selectedPaciente.email);
                    setIdSeguro(selectedPaciente.id_seguro);
                  }}>
                  <Pencil size={18} /> Editar
                </button>
                <button className="lp-btn-danger-soft" onClick={() => { setIsDetailsModalOpen(false); setIsDeleteModalOpen(true); }}>
                  <Trash2 size={18} /> Eliminar
                </button>
              </div>
              <button className="lp-btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* OTROS MODALES (Simplificados por brevedad, mantienen funcionalidad) */}
      {isCreateSeguroModalOpen && (
        <div className="lp-modal-overlay">
          <div className="lp-modal-content">
            <h3>Nuevo Seguro</h3>
            <div className="lp-form-group" style={{gap:'1rem', marginTop:'1rem'}}>
               <input className="lp-modal-input" placeholder="Nombre" value={nuevoSeguroNombre} onChange={e => setNuevoSeguroNombre(e.target.value.toUpperCase())} />
               <input className="lp-modal-input" placeholder="Contacto" value={nuevoSeguroContacto} onChange={e => handleNameInput(e.target.value, setNuevoSeguroContacto)} />
               <PhoneInput country={'ve'} value={nuevoSeguroTelefono} onChange={val => setNuevoSeguroTelefono(val)} />
            </div>
            <div className="lp-modal-footer" style={{marginTop:'1.5rem'}}>
              <button className="lp-btn-secondary" onClick={() => setIsCreateSeguroModalOpen(false)}>Cancelar</button>
              <button className="lp-btn-primary" onClick={handleCreateSeguro}><Save size={16} /> Guardar</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedPaciente && (
        <div className="lp-modal-overlay">
          <div className="lp-modal-content">
            <div className="lp-modal-header-danger"><AlertTriangle size={28} /><h3>¿Eliminar paciente?</h3></div>
            <p style={{textAlign:'center', margin:'1rem 0'}}>Se eliminará a <strong>{selectedPaciente.nombre}</strong> de forma permanente.</p>
            <div className="lp-modal-footer">
              <button className="lp-btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="lp-btn-danger" onClick={handleDeletePaciente}><Trash2 size={16} /> Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {isStoriesModalOpen && selectedPaciente && (
        <div className="lp-modal-overlay">
          <div className="lp-modal-content" style={{ width: '95%', maxWidth: '1200px' }}>
            <ListStories pacienteId={selectedPaciente.id} />
            <div className="lp-modal-footer">
              <button className="lp-btn-secondary" onClick={() => setIsStoriesModalOpen(false)}>Cerrar Historias</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPatients;