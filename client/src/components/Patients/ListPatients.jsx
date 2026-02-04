import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select"; // Importamos React Select
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
import ListStories from "./ListStories";
import MediaUploader from "../Multimedia/MediaUploader";
import "../../styles/components/ListZone.css";

const ListPatients = () => {
  const {
    pacientes,
    medicos,
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
  const [documento, setDocumento] = useState("");
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

  // ---------------- FORMATOS ----------------
  const handleNameInput = (value, setter) => {
    setter(value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase());
  };

  const handleNameUpperInput = (value, setter) => {
    setter(value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase());
  };

  const handleDocumentoInput = (value, setter) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    setter(digits ? `V-${digits}` : "V-");
  };

  const handlePhoneInput = (value, setter) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    setter(digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits);
  };

  const handleEmailInput = (value, setter) => {
    setter(value.replace(/\s/g, ""));
  };

  const resetForm = () => {
    setNombre("");
    setDocumento("");
    setTelefono("");
    setEmail("");
    setIdSeguro("");
    setSelectedPaciente(null);
    setIsEditing(false);
  };

  // ---------------- CREAR / EDITAR PACIENTE ----------------
  const handleSavePaciente = async () => {
    if (!nombre || !documento) return;

    const payload = {
      nombre,
      documento,
      telefono,
      email,
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
    if (!nuevoSeguroNombre || !nuevoSeguroContacto || !nuevoSeguroTelefono) return;

    await createNewSeguro({
      nombre: nuevoSeguroNombre,
      contacto: nuevoSeguroContacto,
      telefono: nuevoSeguroTelefono,
      estatus: true
    });

    setNuevoSeguroNombre("");
    setNuevoSeguroContacto("");
    setNuevoSeguroTelefono("");
    setIsCreateSeguroModalOpen(false);
    getAllSeguros();
  };

  // ---------------- ELIMINAR ----------------
  const handleDeletePaciente = async () => {
    if (!selectedPaciente) return;
    await deletePacienteById(selectedPaciente.id);
    setIsDeleteModalOpen(false);
    setSelectedPaciente(null);
    getAllPacientes();
  };

  // Estilos personalizados para React Select
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
        <button
          className="btn-primary"
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        >
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
                <button
                  className="icon-btn"
                  onClick={() => {
                    setSelectedPaciente(p);
                    setIsDetailsModalOpen(true);
                  }}
                >
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
            <input
              className="modal-input"
              placeholder="Nombre"
              value={nombre}
              onChange={e => handleNameInput(e.target.value, setNombre)}
            />
            <input
              className="modal-input"
              placeholder="Documento (V-12345678)"
              value={documento}
              onChange={e => handleDocumentoInput(e.target.value, setDocumento)}
            />
            <input
              className="modal-input"
              placeholder="Teléfono (1234-1234567)"
              value={telefono}
              onChange={e => handlePhoneInput(e.target.value, setTelefono)}
            />
            <input
              className="modal-input"
              placeholder="Email"
              value={email}
              onChange={e => handleEmailInput(e.target.value, setEmail)}
            />

            <div className="select-zone-container">
              <div style={{ flex: 1 }}>
                <Select
                  options={seguroOptions}
                  value={currentSeguroValue}
                  onChange={(option) => setIdSeguro(option ? option.value : "")}
                  placeholder="Seleccionar seguro..."
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No hay seguros registrados"}
                  styles={customSelectStyles}
                />
              </div>
              <button
                className="btn-add-zone-primary"
                onClick={() => setIsCreateSeguroModalOpen(true)}
                title="Nuevo Seguro"
              >
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
              <div className="detail-card"><strong>Teléfono:</strong> {selectedPaciente.telefono}</div>
              <div className="detail-card"><strong>Email:</strong> {selectedPaciente.email}</div>
              <div className="detail-card"><strong>Seguro:</strong> {seguros.find(s => s.id === selectedPaciente.id_seguro)?.nombre || "-"}</div>
            </div>
            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button
                className="btn-primary"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setIsStoriesModalOpen(true);
                }}
              >
                <FileText size={16} />Historias
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setIsCreateModalOpen(true);
                  setIsEditing(true);
                  setNombre(selectedPaciente.nombre);
                  setDocumento(selectedPaciente.documento);
                  setTelefono(selectedPaciente.telefono);
                  setEmail(selectedPaciente.email);
                  setIdSeguro(selectedPaciente.id_seguro);
                }}
              >
                <Pencil size={16} /> Editar
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setIsDeleteModalOpen(true);
                }}
              >
                <Trash2 size={16} /> Eliminar
              </button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LIST STORIES */}
      {isStoriesModalOpen && selectedPaciente && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '90%', maxWidth: '1200px' }}>
            <h3>Historias de {selectedPaciente.nombre}</h3>
            <ListStories pacienteId={selectedPaciente.id} />
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsStoriesModalOpen(false);
                  setSelectedPaciente(null);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR PACIENTE */}
      {isDeleteModalOpen && selectedPaciente && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar paciente?</h3>
            </div>
            <p>Esta acción no se puede deshacer</p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDeletePaciente}><Trash2 size={16} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR SEGURO */}
      {isCreateSeguroModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nuevo Seguro</h3>
            <input
              className="modal-input"
              placeholder="Nombre"
              value={nuevoSeguroNombre}
              onChange={(e) => setNuevoSeguroNombre(e.target.value.toUpperCase())}
            />
            <input
              className="modal-input"
              placeholder="Contacto"
              value={nuevoSeguroContacto}
              onChange={e => handleNameInput(e.target.value, setNuevoSeguroContacto)}
            />
            <input
              className="modal-input"
              placeholder="Teléfono"
              value={nuevoSeguroTelefono}
              onChange={e => handlePhoneInput(e.target.value, setNuevoSeguroTelefono)}
            />
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsCreateSeguroModalOpen(false);
                  setNuevoSeguroNombre("");
                  setNuevoSeguroContacto("");
                  setNuevoSeguroTelefono("");
                }}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleCreateSeguro}>
                <Save size={16} /> Guardar Seguro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPatients;