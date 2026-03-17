import React, { useEffect, useState, useMemo } from "react";
import { useEntity } from "../../context/EntityContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  AlertTriangle,
  Plus
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import DepositsFormModal from "./ui/DepositsFormModal";
import "../../styles/components/ListZone.css";

const ListDeposits = () => {
  const { 
    entities, 
    getAllEntities, 
    deleteEntityById 
  } = useEntity();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Estados de Control
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const deposits = entities.depositos || [];

  useEffect(() => {
    getAllEntities("depositos");
  }, []);

  // -------------------- Filtrado y Ordenación Alfabética --------------------
  const filteredDeposits = useMemo(() => {
    const list = deposits || [];

    // 1. Filtrar
    const filtered = list.filter(d =>
      d.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );

    // 2. Ordenar A-Z
    return [...filtered].sort((a, b) => {
      const nameA = (a.nombre || "").toUpperCase();
      const nameB = (b.nombre || "").toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }, [deposits, searchTerm]);

  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);
  const currentDeposits = filteredDeposits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Acciones
  const openCreateModal = () => {
    setSelectedDeposit(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (deposit) => {
    setSelectedDeposit(deposit);
    setIsFormModalOpen(true);
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
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Nuevo Depósito
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="BUSCAR DEPÓSITO..."
            value={searchTerm}
            style={{ textTransform: 'uppercase' }}
            onChange={(e) => { 
              setSearchTerm(e.target.value.toUpperCase()); 
              setCurrentPage(1); 
            }}
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
                  <td className="bold">{deposit.nombre.toUpperCase()}</td>
                  <td className="hide-mobile">
                    <span className="badge active">ACTIVO</span>
                  </td>
                  <td className="center">
                    <button className="icon-btn edit" onClick={() => { setSelectedDeposit(deposit); setIsDetailsModalOpen(true); }}>
                      <SlOptionsVertical size={16}/>
                    </button>
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

      {/* --- MODAL DE FORMULARIO (NUEVO/EDITAR) --- */}
      <DepositsFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        deposit={selectedDeposit}
      />

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedDeposit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar depósito?</h3>
            </div>
            <p>Confirma que deseas eliminar <strong>{selectedDeposit.nombre.toUpperCase()}</strong></p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDelete}><Trash2 size={16} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES MÓVIL/OPCIONES */}
      {isDetailsModalOpen && selectedDeposit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>DETALLES DE DEPÓSITO</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> <span>#{selectedDeposit.id}</span></div>
              <div className="detail-card"><strong>Nombre:</strong> <span className="bold">{selectedDeposit.nombre.toUpperCase()}</span></div>
              <div className="detail-card"><strong>Estatus:</strong> <span>ACTIVO</span></div>
            </div>

            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn-primary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedDeposit); }}>
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
    </div>
  );
};

export default ListDeposits;