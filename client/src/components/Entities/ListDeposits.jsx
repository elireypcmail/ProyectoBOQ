import React, { useEffect, useState, useMemo } from "react";
import { useEntity } from "../../context/EntityContext";
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
import "../../styles/components/ListZone.css";

const ListDeposits = () => {
  const { 
    entities, 
    getAllEntities, 
    createNewEntity, 
    editedEntity, 
    deleteEntityById 
  } = useEntity();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modales
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editName, setEditName] = useState("");

  const deposits = entities.depositos || [];

  useEffect(() => {
    getAllEntities("depositos");
  }, []);

  // -------------------- Función de formateo --------------------
  const handleNameInput = (value, setter) => {
    const formatted = value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase();
    setter(formatted);
  };

  const filteredDeposits = useMemo(() => {
    return deposits.filter(d =>
      d.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [deposits, searchTerm]);

  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);
  const currentDeposits = filteredDeposits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------- Acciones --------------------
  const openEditModal = (deposit) => {
    setSelectedDeposit(deposit);
    setEditName(deposit.nombre);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (deposit) => {
    setSelectedDeposit(deposit);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!editName.trim()) return;
    try {
      await createNewEntity("depositos", { nombre: editName.trim() });
      setIsCreateModalOpen(false);
      setEditName("");
      getAllEntities("depositos");
    } catch (error) {
      console.error("Error al crear depósito:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !selectedDeposit) return;
    try {
      await editedEntity("depositos", selectedDeposit.id, { nombre: editName.trim() });
      setIsEditModalOpen(false);
      setSelectedDeposit(null);
      setEditName("");
      getAllEntities("depositos");
    } catch (error) {
      console.error("Error al editar depósito:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedDeposit) return;
    try {
      await deleteEntityById("depositos", selectedDeposit.id);
      setIsDeleteModalOpen(false);
      setSelectedDeposit(null);
      getAllEntities("depositos");
    } catch (error) {
      console.error("Error al eliminar depósito:", error);
    }
  };

  return (
    <div className="orders-container">

      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Gestión de Depósitos</h2>
          <p>{filteredDeposits.length} depósitos registrados</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditName(""); setIsCreateModalOpen(true); }}>
          <Plus size={16} /> Nuevo Depósito
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar depósito..."
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
              <th className="hide-mobile">Estatus</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentDeposits.length > 0 ? (
              currentDeposits.map(deposit => (
                <tr key={deposit.id}>
                  <td className="id hide-mobile">#{deposit.id}</td>
                  <td>{deposit.nombre}</td>
                  <td className="hide-mobile">
                    <span className="badge active">Activo</span>
                  </td>
                  <td className="center">
                    <div className="actions-desktop">
                      <button className="icon-btn edit" onClick={() => openEditModal(deposit)}>
                        <Pencil size={16} />
                      </button>
                      <button className="icon-btn delete" onClick={() => openDeleteModal(deposit)}>
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="actions-mobile">
                      <button className="icon-btn" onClick={() => { setSelectedDeposit(deposit); setIsDetailsModalOpen(true); }}>
                        &#8942;
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-results">No se encontraron depósitos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="orders-pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft size={18} />
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODAL CREAR */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Crear Depósito</h3>
            <input 
              className="modal-input" 
              value={editName} 
              onChange={(e) => handleNameInput(e.target.value, setEditName)} 
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate}><Save size={16} /> Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {isEditModalOpen && selectedDeposit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Depósito</h3>
            <input 
              className="modal-input" 
              value={editName} 
              onChange={(e) => handleNameInput(e.target.value, setEditName)} 
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleUpdate}><Save size={16} /> Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedDeposit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar depósito?</h3>
            </div>
            <p>Confirma que deseas eliminar <strong>{selectedDeposit.nombre}</strong></p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDelete}><Trash2 size={16} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES MÓVIL */}
      {isDetailsModalOpen && selectedDeposit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalles de {selectedDeposit.nombre}</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> <span>#{selectedDeposit.id}</span></div>
              <div className="detail-card"><strong>Nombre:</strong> <span>{selectedDeposit.nombre}</span></div>
              <div className="detail-card"><strong>Estado:</strong> <span>Activo</span></div>
            </div>

            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn-primary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedDeposit); }}><Pencil size={16} /> Editar</button>
              <button className="btn-danger" onClick={() => { setIsDetailsModalOpen(false); openDeleteModal(selectedDeposit); }}><Trash2 size={16} /> Eliminar</button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListDeposits;
