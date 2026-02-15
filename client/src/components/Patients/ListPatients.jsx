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
  FileText
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Importar PhoneInput
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import ListStories from "./ListStories";
import "../../styles/components/ListZone.css";

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
  
  // CAMBIO 1: Estado unificado para documento
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

  // --- Lógica para React Select ---
  const seguroOptions = useMemo(() => {
    return seguros.map(s => ({
      value: s.id,
      label: s.nombre
    }));
  }, [seguros]);

  const currentSeguroValue = useMemo(() => {
    return seguroOptions.find(opt => opt.value === idSeguro) || null;
  }, [idSeguro, seguroOptions]);

  const filteredPacientes = useMemo(() => {
    return pacientes.filter(p =>
      p.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [pacientes, searchTerm]);

  // ---------------- FORMATOS Y HELPERS ----------------
  const handleNameInput = (value, setter) => {
    setter(value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase());
  };

  // CAMBIO 2: Lógica unificada de documento (Letra + Guion + 10 Números)
  const handleDocumentInput = (value) => {
    const upperValue = value.toUpperCase();
    const cleanValue = upperValue.replace(/[^A-Z0-9]/g, "");

    if (!cleanValue) {
      setDocumentoField("");
      return;
    }

    const firstChar = cleanValue.charAt(0);
    const rest = cleanValue.slice(1);

    // Validar que primero sea Letra
    if (!/^[A-Z]$/.test(firstChar)) {
      return; 
    }

    // Validar resto Números (max 10)
    const numbersOnly = rest.replace(/[^0-9]/g, "").slice(0, 10);

    const formatted = numbersOnly.length > 0 
      ? `${firstChar}-${numbersOnly}` 
      : firstChar;

    setDocumentoField(formatted);
  };

  const resetForm = () => {
    setNombre("");
    setDocumentoField(""); // Reset campo único
    setTelefono("");
    setEmail("");
    setIdSeguro("");
    setSelectedPaciente(null);
    setIsEditing(false);
  };

  // ---------------- CREAR / EDITAR PACIENTE ----------------
  const handleSavePaciente = async () => {
    if (!nombre || !documentoField) return alert("Nombre y documento son obligatorios");

    // Validación simple de longitud mínima (Letra + Guion + al menos 1 número)
    if (documentoField.length < 3) {
        alert("El documento debe tener un formato válido (Ej: V-123456)");
        return;
    }

    const payload = {
      nombre,
      documento: documentoField, // Se envía directo
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

  // ---------------- CREAR SEGURO ----------------
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
      borderRadius: "8px",
      borderColor: "#e2e8f0",
      minHeight: "45px",
      boxShadow: "none",
      "&:hover": { borderColor: "#cbd5e1" }
    }),
    menu: (base) => ({ ...base, borderRadius: "8px", zIndex: 9999 }),
    placeholder: (base) => ({ ...base, color: "#94a3b8" })
  };

  return (
    <div className="orders-container">
      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Pacientes</h2>
          <p>Total: {filteredPacientes.length}</p>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setIsCreateModalOpen(true); }}>
          <Plus size={16} /> Nuevo Paciente
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      {/* TABLA */}
      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th className="hide-mobile">Documento</th>
            <th className="center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredPacientes.map(p => (
            <tr key={p.id}>
              <td>#{p.id}</td>
              <td>{p.nombre}</td>
              <td className="hide-mobile">{p.documento}</td>
              <td className="center">
                <button className="icon-btn" onClick={() => { setSelectedPaciente(p); setIsDetailsModalOpen(true); }}>
                  <SlOptionsVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL CREAR / EDITAR PACIENTE */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditing ? "Editar Paciente" : "Nuevo Paciente"}</h3>
            
            <label className="modal-label">Nombre Completo</label>
            <input
              className="modal-input"
              placeholder="Ej: MARÍA PÉREZ"
              value={nombre}
              onChange={e => handleNameInput(e.target.value, setNombre)}
            />

            <label className="modal-label">Documento</label>
            {/* CAMBIO 3: Input Único */}
            <input
                className="modal-input"
                placeholder="Ej: V-12345678 (Letra + Números)"
                value={documentoField}
                onChange={(e) => handleDocumentInput(e.target.value)}
            />

            <label className="modal-label">Teléfono</label>
            <div className="phone-input-container" style={{ marginBottom: '15px' }}>
              <PhoneInput
                country={'ve'}
                value={telefono}
                onChange={val => setTelefono(val)}
                inputStyle={{ width: '100%', height: '45px', borderRadius: '8px' }}
              />
            </div>

            <label className="modal-label">Email</label>
            <input
              className="modal-input"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value.replace(/\s/g, ""))}
            />

            <label className="modal-label">Seguro Médico</label>
            <div className="select-zone-container">
              <div style={{ flex: 1 }}>
                <Select
                  options={seguroOptions}
                  value={currentSeguroValue}
                  onChange={(option) => setIdSeguro(option ? option.value : "")}
                  placeholder="Seleccionar seguro..."
                  isClearable
                  isSearchable
                  styles={customSelectStyles}
                />
              </div>
              <button className="btn-add-zone-primary" onClick={() => setIsCreateSeguroModalOpen(true)}>
                <Plus size={16} />
              </button>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSavePaciente}>
                <Save size={16} /> {isEditing ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES PACIENTE */}
      {isDetailsModalOpen && selectedPaciente && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalles de {selectedPaciente.nombre}</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>Documento:</strong> {selectedPaciente.documento}</div>
              <div className="detail-card"><strong>Teléfono:</strong> {selectedPaciente.telefono ? `+${selectedPaciente.telefono}` : "-"}</div>
              <div className="detail-card"><strong>Email:</strong> {selectedPaciente.email || "-"}</div>
              <div className="detail-card"><strong>Seguro:</strong> {seguros.find(s => s.id === selectedPaciente.id_seguro)?.nombre || "-"}</div>
            </div>
            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn-primary" onClick={() => { setIsDetailsModalOpen(false); setIsStoriesModalOpen(true); }}>
                <FileText size={16} /> Historias
              </button>
              <button className="btn-primary" onClick={() => {
                  setIsDetailsModalOpen(false);
                  setIsCreateModalOpen(true);
                  setIsEditing(true);
                  setNombre(selectedPaciente.nombre);
                  
                  // CAMBIO 4: Cargar documento directo al estado unificado
                  setDocumentoField(selectedPaciente.documento || "");
                  
                  setTelefono(selectedPaciente.telefono);
                  setEmail(selectedPaciente.email);
                  setIdSeguro(selectedPaciente.id_seguro);
                }}>
                <Pencil size={16} /> Editar
              </button>
              <button className="btn-danger" onClick={() => { setIsDetailsModalOpen(false); setIsDeleteModalOpen(true); }}>
                <Trash2 size={16} /> Eliminar
              </button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR SEGURO */}
      {isCreateSeguroModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nuevo Seguro</h3>
            <input className="modal-input" placeholder="Nombre de la empresa" value={nuevoSeguroNombre} onChange={e => setNuevoSeguroNombre(e.target.value.toUpperCase())} />
            <input className="modal-input" placeholder="Persona de contacto" value={nuevoSeguroContacto} onChange={e => handleNameInput(e.target.value, setNuevoSeguroContacto)} />
            
            <div className="phone-input-container" style={{ marginBottom: '15px' }}>
              <PhoneInput
                country={'ve'}
                value={nuevoSeguroTelefono}
                onChange={val => setNuevoSeguroTelefono(val)}
                inputStyle={{ width: '100%', height: '40px' }}
              />
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreateSeguroModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreateSeguro}><Save size={16} /> Guardar Seguro</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR PACIENTE */}
      {isDeleteModalOpen && selectedPaciente && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger"><AlertTriangle size={28} /><h3>¿Eliminar paciente?</h3></div>
            <p>Se eliminará a <strong>{selectedPaciente.nombre}</strong>. Esta acción no se puede deshacer.</p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDeletePaciente}><Trash2 size={16} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTORIAS */}
      {isStoriesModalOpen && selectedPaciente && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '95%', maxWidth: '1200px' }}>
            <ListStories pacienteId={selectedPaciente.id} />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsStoriesModalOpen(false)}>Cerrar Historias</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPatients;