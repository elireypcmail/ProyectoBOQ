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
import Select from "react-select"; // <- react-select import
import { SlOptionsVertical } from "react-icons/sl";
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
  const [editPhone, setEditPhone] = useState("");
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
      .replace(/[^a-zA-Z0-9ÁÉÍÓÚÜÑáéíóúüñ\s]/g, "")
      .toUpperCase();
    setter(formatted);
  };

  const handlePhoneInput = (value) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length > 11) digits = digits.slice(0, 11);
    if (digits.length > 4) return digits.slice(0, 4) + "-" + digits.slice(4);
    return digits;
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
    setSelectedTipoId(medico.id_tipo);
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
      setEditName("");
      setEditPhone("");
      setSelectedTipoId("");
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
      setEditName("");
      setEditPhone("");
      setSelectedTipoId("");
      getAllMedicos();
    } catch (error) {
      console.error("Error editando médico:", error);
    }
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

  // -------------------- Render --------------------
  return (
    <div className="orders-container">
      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Gestión de Personal Médico</h2>
          <p>Personal médico registrado: {filteredMedicos.length}</p>
        </div>
        <button className="btn-primary" onClick={() => { 
          setEditName(""); 
          setEditPhone(""); 
          setSelectedTipoId(""); 
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
                <td className="hide-mobile">{medico.telefono || "-"}</td>
                <td className="hide-mobile">{medico.tipo}</td>
                <td className="center">
                  <div className="actions-desktop">
                    <button className="icon-btn edit" onClick={() => { 
                      setSelectedMedico(medico); 
                      setIsDetailsModalOpen(true); 
                    }}>
                      <SlOptionsVertical size={16}/>
                    </button>
                  </div>
                  <div className="actions-mobile">
                    <button className="icon-btn" onClick={() => { 
                      setSelectedMedico(medico); 
                      setIsDetailsModalOpen(true); 
                    }}>
                      &#8942;
                    </button>
                  </div>
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
            <input
              className="modal-input"
              placeholder="Nombre"
              value={editName}
              onChange={(e) => handleNameInput(e.target.value, setEditName)}
            />
            <input
              className="modal-input"
              placeholder="Teléfono"
              value={editPhone}
              onChange={(e) => setEditPhone(handlePhoneInput(e.target.value))}
            />

            {!isCreatingTipo ? (
              <div className="select-zone-container">
                <div style={{ flex: 1 }}>
                  <Select
                    placeholder="Selecciona un tipo de médico"
                    options={tipoOptions}
                    value={selectedTipoOption}
                    onChange={(option) => setSelectedTipoId(option ? option.value : "")}
                    isClearable
                    classNamePrefix="react-select"
                  />
                </div>
                <button className="btn-add-zone-primary" onClick={() => setIsCreatingTipo(true)}>
                  <Plus size={16} /> Tipo
                </button>
              </div>
            ) : (
              <div className="new-zone-container">
                <label>Nuevo Tipo de Médico</label>
                <div className="new-zone-inputs">
                  <input
                    className="modal-input"
                    placeholder="Nombre del nuevo tipo"
                    value={newTipoName}
                    onChange={(e) => handleNameInput(e.target.value, setNewTipoName)}
                  />
                  <button className="btn-primary" onClick={handleCreateTipo}><Save size={16} /> Guardar</button>
                  <button className="btn-secondary" onClick={() => { setIsCreatingTipo(false); setNewTipoName(""); }}>Cancelar</button>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setIsCreateModalOpen(false); setIsEditModalOpen(false);
                setEditName(""); setEditPhone(""); setSelectedTipoId("");
                setIsCreatingTipo(false); setNewTipoName("");
              }}>Cancelar</button>
              <button className="btn-primary" onClick={isCreateModalOpen ? handleCreate : handleUpdate}><Save size={16} /> {isCreateModalOpen ? "Crear" : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedMedico && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalles de {selectedMedico.nombre}</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> <span>#{selectedMedico.id}</span></div>
              <div className="detail-card"><strong>Nombre:</strong> <span>{selectedMedico.nombre}</span></div>
              <div className="detail-card"><strong>Tipo:</strong> <span>{selectedMedico.tipo}</span></div>
              <div className="detail-card"><strong>Teléfono:</strong> <span>{selectedMedico.telefono || "-"}</span></div>
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
            <p>Confirma que deseas eliminar <strong>{selectedMedico.nombre}</strong></p>
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
