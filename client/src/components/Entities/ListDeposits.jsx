import React, { useEffect, useState, useMemo } from "react";
import { useEntity } from "../../context/EntityContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import DepositsFormModal from "./ui/DepositsFormModal";
import "../../styles/components/ListZone.css";

const ListDeposits = () => {
  const { entities, getAllEntities, deleteEntityById } = useEntity();

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
    const filtered = list.filter((d) =>
      d.nombre.toUpperCase().includes(searchTerm.toUpperCase()),
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
    currentPage * itemsPerPage,
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
    <div className="pl-main-container">
      {/* Encabezado */}
      <div className="pl-header-section">
        <div className="pl-title-group">
          <h2>Gestión de Depósitos</h2>
          <p>{filteredDeposits.length} depósitos registrados</p>
        </div>
        <div className="pl-actions-group">
          <button className="pl-btn-action" onClick={openCreateModal}>
            <Plus size={16} /> Nuevo Depósito
          </button>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="pl-toolbar">
        <div className="pl-search-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="BUSCAR DEPÓSITO..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value.toUpperCase());
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Tabla de Depósitos con etiquetas responsive */}
      <div className="pl-table-frame">
        <table className="pl-data-table">
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>ID</th>
              <th style={{ textAlign: "left", paddingLeft: "1.5rem" }}>
                Nombre
              </th>
              <th>Estatus</th>
              <th style={{ textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentDeposits.length > 0 ? (
              currentDeposits.map((deposit) => (
                <tr key={deposit.id}>
                  <td
                    className="pl-sku-cell"
                    data-label="ID"
                    style={{ textAlign: "center" }}
                  >
                    #{deposit.id}
                  </td>
                  <td
                    className="pl-desc-cell"
                    data-label="Nombre"
                    style={{
                      textAlign: "left",
                      paddingLeft: "1.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    {deposit.nombre.toUpperCase()}
                  </td>
                  <td data-label="Estatus">
                    <span className="badge active">ACTIVO</span>
                  </td>
                  <td
                    className="pl-actions-cell"
                    data-label="Acciones"
                    style={{ textAlign: "center" }}
                  >
                    <button
                      className="pl-icon-only-btn"
                      onClick={() => {
                        setSelectedDeposit(deposit);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <SlOptionsVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="no-results"
                  style={{ padding: "2rem", textAlign: "center" }}
                >
                  No se encontraron depósitos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pl-pagination-area">
          <button
            className="pl-page-node"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="pl-muted">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="pl-page-node"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
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
        <div className="pl-modal-overlay">
          <div className="pl-modal-box">
            <div
              className="pl-modal-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                color: "var(--pl-danger)",
              }}
            >
              <AlertTriangle size={24} />
              <span>¿Eliminar depósito?</span>
            </div>
            <p style={{ margin: "1rem 0", color: "var(--pl-text-main)" }}>
              Confirma que deseas eliminar{" "}
              <strong>{selectedDeposit.nombre.toUpperCase()}</strong>
            </p>
            <div className="pl-modal-footer">
              <button
                className="pl-btn-secondary-outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button className="pl-btn-danger-soft" onClick={handleDelete}>
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedDeposit && (
        <div className="pl-modal-overlay">
          <div className="pl-modal-box">
            <h3 className="pl-modal-title">DETALLES DEL DEPÓSITO</h3>

            <div className="pl-info-list">
              <div className="pl-info-item">
                <span className="pl-modal-label" style={{ margin: 0 }}>
                  ID
                </span>
                <span style={{ fontWeight: 600 }}>#{selectedDeposit.id}</span>
              </div>
              <div className="pl-info-item">
                <span className="pl-modal-label" style={{ margin: 0 }}>
                  Nombre
                </span>
                <span style={{ fontWeight: 600 }}>
                  {selectedDeposit.nombre.toUpperCase()}
                </span>
              </div>
              <div className="pl-info-item">
                <span className="pl-modal-label" style={{ margin: 0 }}>
                  Estatus
                </span>
                <span className="badge active">ACTIVO</span>
              </div>
            </div>

            <div className="pl-modal-footer-stack">
              <button
                className="pl-btn-secondary"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  openEditModal(selectedDeposit);
                }}
              >
                <Pencil size={16} /> Editar
              </button>
              <button
                className="pl-btn-danger-soft"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setIsDeleteModalOpen(true);
                }}
              >
                <Trash2 size={16} /> Eliminar
              </button>
              <button
                className="pl-btn-secondary-outline"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListDeposits;
