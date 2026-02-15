import React, { useEffect, useState, useMemo } from "react";
import { useHealth } from "../../context/HealtContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  Plus
} from "lucide-react";
import Select from "react-select"; 
import { SlOptionsVertical } from "react-icons/sl";

// 1. Importar la dependencia de teléfono y sus estilos
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import "../../styles/components/ListZone.css";

const ListDoctors = () => {
  const { 
    medicos,
    tipoMedicos,
    getAllMedicos,
    getAllTipoMedicos,
    createNewMedico,
    editedMedico,
    deleteMedicoById,
    createNewTipoMedico
  } = useHealth();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modales
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState(""); // Aquí se guardará el nro internacional
  const [selectedTipoId, setSelectedTipoId] = useState("");

  // Crear tipo de médico al vuelo
  const [isCreatingTipo, setIsCreatingTipo] = useState(false);
  const [newTipoName, setNewTipoName] = useState("");

  useEffect(() => {
    getAllMedicos();
    getAllTipoMedicos();
  }, []);

  // -------------------- Formateo inputs --------------------
  const handleNameInput = (value, setter) => {
    const formatted = value
      .replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "")
      .toUpperCase();
    setter(formatted);
  };

  // -------------------- Filtrado y paginación --------------------
  const filteredMedicos = useMemo(() => {
    return medicos.filter(m =>
      m.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [medicos, searchTerm]);

  const totalPages = Math.ceil(filteredMedicos.length / itemsPerPage);
  const currentMedicos = filteredMedicos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------- React-Select opciones --------------------
  const tipoOptions = useMemo(() =>
    tipoMedicos.map(tipo => ({ value: tipo.id, label: tipo.nombre })),
    [tipoMedicos]
  );

  const selectedTipoOption = tipoOptions.find(
    opt => opt.value === Number(selectedTipoId)
  ) || null;

  // -------------------- Acciones --------------------
  const openEditModal = (medico) => {
    setSelectedMedico(medico);
    setEditName(medico.nombre);
    setEditPhone(medico.telefono || "");
    setSelectedTipoId(medico.id_tipomedico);
    setIsEditModalOpen(true);
    setIsCreatingTipo(false);
    setNewTipoName("");
  };

  const openDeleteModal = (medico) => {
    setSelectedMedico(medico);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!editName.trim() || !selectedTipoId) return;
    try {
      const newMedico = {
        nombre: editName.trim(),
        telefono: editPhone || "",
        id_tipoMedico: Number(selectedTipoId),
        estatus: true
      };
      await createNewMedico(newMedico);
      setIsCreateModalOpen(false);
      resetStates();
      getAllMedicos();
    } catch (error) {
      console.error("Error creando médico:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !selectedTipoId || !selectedMedico) return;
    try {
      const updatedMedico = {
        nombre: editName.trim(),
        telefono: editPhone || "",
        id_tipoMedico: Number(selectedTipoId),
        estatus: true
      };
      await editedMedico(selectedMedico.id, updatedMedico);
      setIsEditModalOpen(false);
      setSelectedMedico(null);
      resetStates();
      getAllMedicos();
    } catch (error) {
      console.error("Error editando médico:", error);
    }
  };

  const resetStates = () => {
    setEditName("");
    setEditPhone("");
    setSelectedTipoId("");
    setIsCreatingTipo(false);
    setNewTipoName("");
  };

  const handleDelete = async () => {
    if (!selectedMedico) return;
    try {
      await deleteMedicoById(selectedMedico.id);
      setIsDeleteModalOpen(false);
      setSelectedMedico(null);
      getAllMedicos();
    } catch (error) {
      console.error("Error eliminando médico:", error);
    }
  };

  const handleCreateTipo = async () => {
    if (!newTipoName.trim()) return;
    try {
      const res = await createNewTipoMedico({ nombre: newTipoName.trim() });
      setSelectedTipoId(res.data.id);
      setIsCreatingTipo(false);
      setNewTipoName("");
      getAllTipoMedicos();
    } catch (error) {
      console.error("Error creando tipo de médico:", error);
    }
  };

  return (
    <div className="orders-container">
      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Gestión de Personal Médico</h2>
          <p>Personal médico registrado: {filteredMedicos.length}</p>
        </div>
        <button className="btn-primary" onClick={() => { 
          resetStates();
          setIsCreateModalOpen(true); 
        }}>
          <Plus size={16} /> Nuevo Médico
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar personal médico..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th className="hide-mobile">ID</th>
              <th>Nombre</th>
              <th className="hide-mobile">Teléfono</th>
              <th className="hide-mobile">Tipo</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentMedicos.length > 0 ? currentMedicos.map(medico => (
              <tr key={medico.id}>
                <td className="id hide-mobile">#{medico.id}</td>
                <td>{medico.nombre}</td>
                <td className="hide-mobile">{medico.telefono ? `+${medico.telefono}` : "-"}</td>
                <td className="hide-mobile">{medico.tipo}</td>
                <td className="center">
                  <button className="icon-btn" onClick={() => { 
                    setSelectedMedico(medico); 
                    setIsDetailsModalOpen(true); 
                  }}>
                    <SlOptionsVertical size={16}/>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="no-results">No se encontraron médicos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="orders-pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18} /></button>
          <span>Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18} /></button>
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isCreateModalOpen ? "Crear Médico" : "Editar Médico"}</h3>
            
            <label className="modal-label">Nombre Completo</label>
            <input
              className="modal-input"
              placeholder="Ej: DR. JUAN PÉREZ"
              value={editName}
              onChange={(e) => handleNameInput(e.target.value, setEditName)}
            />

            <label className="modal-label">Teléfono</label>
            <div className="phone-input-container" style={{ marginBottom: '15px' }}>
              <PhoneInput
                country={'ve'}
                value={editPhone}
                onChange={(value) => setEditPhone(value)}
                inputStyle={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #ccc'
                }}
                buttonStyle={{
                    borderRadius: '8px 0 0 8px'
                }}
              />
            </div>

            <label className="modal-label">Especialidad / Tipo</label>
            {!isCreatingTipo ? (
              <div className="select-zone-container">
                <div style={{ flex: 1 }}>
                  <Select
                    placeholder="Selecciona especialidad..."
                    options={tipoOptions}
                    value={selectedTipoOption}
                    onChange={(option) => setSelectedTipoId(option ? option.value : "")}
                    isClearable
                    classNamePrefix="react-select"
                  />
                </div>
                <button className="btn-add-zone-primary" onClick={() => setIsCreatingTipo(true)}>
                  <Plus size={16} /> Nuevo
                </button>
              </div>
            ) : (
              <div className="new-zone-container">
                <div className="new-zone-inputs">
                  <input
                    className="modal-input"
                    placeholder="Nombre del nuevo tipo"
                    value={newTipoName}
                    onChange={(e) => setNewTipoName(e.target.value.toUpperCase())}
                  />
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn-primary" onClick={handleCreateTipo}><Save size={16} /></button>
                    <button className="btn-secondary" onClick={() => { setIsCreatingTipo(false); setNewTipoName(""); }}>X</button>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setIsCreateModalOpen(false); 
                setIsEditModalOpen(false);
                resetStates();
              }}>Cancelar</button>
              <button className="btn-primary" onClick={isCreateModalOpen ? handleCreate : handleUpdate}>
                <Save size={16} /> {isCreateModalOpen ? "Crear" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedMedico && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalles del Médico</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> <span>#{selectedMedico.id}</span></div>
              <div className="detail-card"><strong>Nombre:</strong> <span>{selectedMedico.nombre}</span></div>
              <div className="detail-card"><strong>Tipo:</strong> <span>{selectedMedico.tipo}</span></div>
              <div className="detail-card"><strong>Teléfono:</strong> <span>{selectedMedico.telefono ? `+${selectedMedico.telefono}` : "-"}</span></div>
              <div className="detail-card"><strong>Estatus:</strong> <span>Activo</span></div>
            </div>
            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn-primary" onClick={() => { 
                setIsDetailsModalOpen(false); 
                openEditModal(selectedMedico); 
              }}><Pencil size={16} /> Editar</button>
              <button className="btn-danger" onClick={() => { 
                setIsDetailsModalOpen(false); 
                openDeleteModal(selectedMedico); 
              }}><Trash2 size={16} /> Eliminar</button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedMedico && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar médico?</h3>
            </div>
            <p>¿Estás seguro de eliminar a <strong>{selectedMedico.nombre}</strong>?</p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDelete}><Trash2 size={16} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListDoctors;