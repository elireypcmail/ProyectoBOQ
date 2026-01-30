import React, { useEffect, useState, useMemo } from "react";
import { useHealth } from "../../context/HealtContext";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Save, AlertTriangle } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import "../../styles/components/ListZone.css";

const ListTypesDoctor = () => {
  const { tipoMedicos, getAllTipoMedicos, createNewTipoMedico, editedTipoMedico, deleteTipoMedicoById } = useHealth();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modales
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [newTipoName, setNewTipoName] = useState("");

  useEffect(() => {
    getAllTipoMedicos();
  }, []);

  // Filtrado y paginación
  const filteredTipos = useMemo(() => {
    return tipoMedicos.filter(tipo =>
      tipo.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [tipoMedicos, searchTerm]);

  const totalPages = Math.ceil(filteredTipos.length / itemsPerPage);
  const currentTipos = filteredTipos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------- Funciones --------------------
  const handleNameInput = (value, setter) => {
  const formatted = value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ0-9\s]/g, "").toUpperCase();
    setter(formatted);
  };

  const openEditModal = (tipo) => {
    setSelectedTipo(tipo);
    setEditName(tipo.nombre);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (tipo) => {
    setSelectedTipo(tipo);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!newTipoName.trim()) return;
    await createNewTipoMedico({ nombre: newTipoName.trim() });
    setNewTipoName("");
    setIsCreateModalOpen(false);
    getAllTipoMedicos();
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !selectedTipo) return;
    await editedTipoMedico(selectedTipo.id, { nombre: editName.trim() });
    setSelectedTipo(null);
    setIsEditModalOpen(false);
    setEditName("");
    getAllTipoMedicos();
  };

  const handleDelete = async () => {
    if (!selectedTipo) return;
    await deleteTipoMedicoById(selectedTipo.id);
    setSelectedTipo(null);
    setIsDeleteModalOpen(false);
    getAllTipoMedicos();
  };

  // -------------------- Render --------------------
  return (
    <div className="orders-container">

      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Tipos de Médicos</h2>
          <p>Total tipos: {filteredTipos.length}</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} /> Nuevo Tipo
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar tipo de médico..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentTipos.length > 0 ? currentTipos.map(tipo => (
              <tr key={tipo.id}>
                <td className="id hide-mobile">#{tipo.id}</td>
                <td>{tipo.nombre}</td>
                <td className="center">
                  <button className="icon-btn" onClick={() => { setSelectedTipo(tipo); setIsDetailsModalOpen(true); }}>
                    <SlOptionsVertical size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="no-results">No se encontraron tipos</td>
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

      {/* MODAL CREAR */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Crear Tipo de Médico</h3>
            <input
              className="modal-input"
              placeholder="Nombre del tipo"
              value={newTipoName}
              onChange={(e) => handleNameInput(e.target.value, setNewTipoName)}
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate}>Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedTipo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalles de {selectedTipo.nombre}</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> <span>#{selectedTipo.id}</span></div>
              <div className="detail-card"><strong>Nombre:</strong> <span>{selectedTipo.nombre}</span></div>
            </div>
            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn-primary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedTipo); }}><Pencil size={16} /> Editar</button>
              <button className="btn-danger" onClick={() => { setIsDetailsModalOpen(false); openDeleteModal(selectedTipo); }}><Trash2 size={16} /> Eliminar</button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {isEditModalOpen && selectedTipo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Tipo de Médico</h3>
            <input
              className="modal-input"
              value={editName}
              onChange={(e) => handleNameInput(e.target.value, setEditName)}
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setIsEditModalOpen(false); setSelectedTipo(null); setEditName(""); }}>Cancelar</button>
              <button className="btn-primary" onClick={handleUpdate}><Save size={16} /> Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedTipo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar tipo de médico?</h3>
            </div>
            <p>Confirma que deseas eliminar <strong>{selectedTipo.nombre}</strong></p>
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

export default ListTypesDoctor;
