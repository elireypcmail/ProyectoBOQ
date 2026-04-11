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
<div className="pl-main-container">
      {/* HEADER */}
      <div className="pl-header-section">
        <div className="pl-title-group">
          <h2>GESTIÓN DE TIPOS DE PERSONAL</h2>
          <p>TOTAL REGISTROS: {filteredTipos.length}</p>
        </div>
        <button className="pl-btn-action" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={18} /> NUEVO TIPO
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="pl-toolbar">
        <div className="pl-search-wrapper">
          <Search size={18} color="var(--pl-muted)" />
          <input
            type="text"
            placeholder="BUSCAR TIPO DE MÉDICO..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value.toUpperCase()); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="pl-table-frame">
        <table className="pl-data-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', paddingLeft: '2rem' }}>NOMBRE DEL TIPO</th>
              <th style={{ width: '100px' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentTipos.length > 0 ? currentTipos.map(tipo => (
              <tr key={tipo.id}>
                <td data-label="NOMBRE" className="bold" style={{ textAlign: 'left', paddingLeft: '2rem' }}>
                  {tipo.nombre.toUpperCase()}
                </td>
                <td data-label="ACCIONES">
                  <button className="pl-icon-only-btn" onClick={() => { setSelectedTipo(tipo); setIsDetailsModalOpen(true); }}>
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
        <div className="pl-pagination-area">
          <button 
            className="pl-page-node"
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="pl-pagination-info">PÁGINA <b>{currentPage}</b> DE {totalPages}</span>
          <button 
            className="pl-page-node"
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => p + 1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

{/* MODAL CREAR */}
      {isCreateModalOpen && (
        <div className="pl-modal-overlay">
          <div className="pl-modal-box">
            <h3 className="pl-modal-title">CREAR TIPO DE MÉDICO</h3>
            <label className="pl-modal-label">NOMBRE DEL TIPO</label>
            <input
              className="pl-modal-input"
              placeholder="EJ: CARDIÓLOGO"
              value={newTipoName}
              onChange={(e) => handleNameInput(e.target.value, setNewTipoName)}
            />
            <div className="pl-modal-footer">
              <button className="pl-btn-secondary-outline" onClick={() => setIsCreateModalOpen(false)}>
                CANCELAR
              </button>
              <button className="pl-btn-action" onClick={handleCreate}>
                CREAR TIPO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedTipo && (
        <div className="pl-modal-overlay">
          <div className="pl-modal-box">
            <h3 className="pl-modal-title">DETALLES DE TIPO</h3>
            <div className="pl-info-list">
              <div className="pl-info-item">
                <span className="pl-modal-label">ID INTERNO:</span>
                <span className="pl-sku-cell">#{selectedTipo.id}</span>
              </div>
              <div className="pl-info-item">
                <span className="pl-modal-label">NOMBRE:</span>
                <span className="bold">{selectedTipo.nombre.toUpperCase()}</span>
              </div>
            </div>
            <div className="pl-modal-footer-stack">
              <button className="pl-btn-secondary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedTipo); }}>
                <Pencil size={16} /> EDITAR REGISTRO
              </button>
              <button className="pl-btn-danger-soft" onClick={() => { setIsDetailsModalOpen(false); openDeleteModal(selectedTipo); }}>
                <Trash2 size={16} /> ELIMINAR TIPO
              </button>
              <button className="pl-btn-secondary-outline" onClick={() => setIsDetailsModalOpen(false)}>
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {isEditModalOpen && selectedTipo && (
        <div className="pl-modal-overlay">
          <div className="pl-modal-box">
            <h3 className="pl-modal-title">EDITAR TIPO DE MÉDICO</h3>
            <label className="pl-modal-label">NUEVO NOMBRE</label>
            <input
              className="pl-modal-input"
              value={editName}
              onChange={(e) => handleNameInput(e.target.value, setEditName)}
            />
            <div className="pl-modal-footer">
              <button className="pl-btn-secondary-outline" onClick={() => { setIsEditModalOpen(false); setSelectedTipo(null); setEditName(""); }}>
                CANCELAR
              </button>
              <button className="pl-btn-secondary" onClick={handleUpdate}>
                <Save size={16} /> GUARDAR CAMBIOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedTipo && (
        <div className="pl-modal-overlay">
          <div className="pl-modal-box" style={{ borderTop: '4px solid var(--pl-danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--pl-danger)' }}>
              <AlertTriangle size={32} />
              <h3 style={{ margin: 0, fontWeight: 800 }}>¿CONFIRMAR ELIMINACIÓN?</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--pl-muted)', lineHeight: '1.5' }}>
              ESTÁS A PUNTO DE ELIMINAR EL TIPO: <br/>
              <strong style={{ color: 'var(--pl-text-main)', fontSize: '1.1rem' }}>{selectedTipo.nombre.toUpperCase()}</strong>
            </p>
            <div className="pl-modal-footer">
              <button className="pl-btn-secondary-outline" onClick={() => setIsDeleteModalOpen(false)}>
                CANCELAR
              </button>
              <button className="pl-btn-danger-soft" onClick={handleDelete} style={{ background: 'var(--pl-danger)', color: 'white' }}>
                SÍ, ELIMINAR
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListTypesDoctor;