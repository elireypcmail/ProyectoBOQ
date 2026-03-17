import React, { useEffect, useState, useMemo } from "react";
import { useHealth } from "../../context/HealtContext";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Save, AlertTriangle, Search } from "lucide-react";
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

  // -------------------- Filtrado y Ordenación Alfabética --------------------
  const filteredTipos = useMemo(() => {
    const list = tipoMedicos || [];
    
    // 1. Filtrar
    const filtered = list.filter(tipo =>
      tipo.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );

    // 2. Ordenar A-Z
    return [...filtered].sort((a, b) => {
      const nameA = (a.nombre || "").toUpperCase();
      const nameB = (b.nombre || "").toUpperCase();
      return nameA.localeCompare(nameB);
    });
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
    setEditName(tipo.nombre.toUpperCase());
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (tipo) => {
    setSelectedTipo(tipo);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!newTipoName.trim()) return;
    await createNewTipoMedico({ nombre: newTipoName.trim().toUpperCase() });
    setNewTipoName("");
    setIsCreateModalOpen(false);
    getAllTipoMedicos();
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !selectedTipo) return;
    await editedTipoMedico(selectedTipo.id, { nombre: editName.trim().toUpperCase() });
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

  return (
    <div className="orders-container">

      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>GESTIÓN DE TIPOS DE PERSONAL</h2>
          <p>TOTAL REGISTROS: {filteredTipos.length}</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} /> NUEVO TIPO
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="BUSCAR TIPO DE MÉDICO..."
            style={{ textTransform: 'uppercase' }}
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value.toUpperCase()); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>NOMBRE</th>
              <th className="center">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentTipos.length > 0 ? currentTipos.map(tipo => (
              <tr key={tipo.id}>
                <td className="bold">{tipo.nombre.toUpperCase()}</td>
                <td className="center">
                  <button className="icon-btn" onClick={() => { setSelectedTipo(tipo); setIsDetailsModalOpen(true); }}>
                    <SlOptionsVertical size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="2" className="no-results">NO SE ENCONTRARON RESULTADOS</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="orders-pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18} /></button>
          <span>PÁGINA {currentPage} DE {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18} /></button>
        </div>
      )}

      {/* MODAL CREAR */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>CREAR TIPO DE MÉDICO</h3>
            <input
              className="modal-input"
              placeholder="NOMBRE DEL TIPO"
              style={{ textTransform: 'uppercase' }}
              value={newTipoName}
              onChange={(e) => handleNameInput(e.target.value, setNewTipoName)}
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>CANCELAR</button>
              <button className="btn-primary" onClick={handleCreate}>CREAR</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedTipo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>DETALLES DE TIPO</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> <span>#{selectedTipo.id}</span></div>
              <div className="detail-card"><strong>NOMBRE:</strong> <span className="bold">{selectedTipo.nombre.toUpperCase()}</span></div>
            </div>
            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn-primary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedTipo); }}><Pencil size={16} /> EDITAR</button>
              <button className="btn-danger" onClick={() => { setIsDetailsModalOpen(false); openDeleteModal(selectedTipo); }}><Trash2 size={16} /> ELIMINAR</button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>CERRAR</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {isEditModalOpen && selectedTipo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>EDITAR TIPO DE MÉDICO</h3>
            <input
              className="modal-input"
              style={{ textTransform: 'uppercase' }}
              value={editName}
              onChange={(e) => handleNameInput(e.target.value, setEditName)}
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setIsEditModalOpen(false); setSelectedTipo(null); setEditName(""); }}>CANCELAR</button>
              <button className="btn-primary" onClick={handleUpdate}><Save size={16} /> GUARDAR</button>
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
              <h3>¿ELIMINAR TIPO?</h3>
            </div>
            <p>CONFIRMA QUE DESEAS ELIMINAR: <br/><strong>{selectedTipo.nombre.toUpperCase()}</strong></p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>CANCELAR</button>
              <button className="btn-danger" onClick={handleDelete}><Trash2 size={16} /> ELIMINAR</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListTypesDoctor;