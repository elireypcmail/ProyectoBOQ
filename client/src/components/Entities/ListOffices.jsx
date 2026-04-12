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
  X
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import OfficesFormModal from "./ui/OfficesFormModal";
import "../../styles/components/ListZone.css";

const ListOffices = ({ onClose }) => {
  const { entities, getAllEntities, deleteEntityById } = useEntity();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Estados de Modales
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const offices = entities.oficinas || [];

  useEffect(() => {
    getAllEntities("oficinas");
    getAllEntities("zonas");
  }, []);

  // Filtrado y Ordenación Alfabética
  const filteredOffices = useMemo(() => {
    const list = offices || [];

    // 1. Filtrar
    const filtered = list.filter((office) =>
      office.nombre.toUpperCase().includes(searchTerm.toUpperCase()),
    );

    // 2. Ordenar A-Z
    return [...filtered].sort((a, b) => {
      const nameA = (a.nombre || "").toUpperCase();
      const nameB = (b.nombre || "").toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }, [offices, searchTerm]);

  const totalPages = Math.ceil(filteredOffices.length / itemsPerPage);
  const currentOffices = filteredOffices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handlers
  const handleOpenCreate = () => {
    setSelectedOffice(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (office) => {
    setSelectedOffice(office);
    setIsFormModalOpen(true);
    setIsDetailsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedOffice) return;
    try {
      await deleteEntityById("oficinas", selectedOffice.id);
      setIsDeleteModalOpen(false);
      setSelectedOffice(null);
      getAllEntities("oficinas");
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="pl-main-container">
      {/* Encabezado */}
      <div className="pl-header-section">
        <div className="pl-title-group">
          <h2>Gestión de Oficinas</h2>
          <p>{filteredOffices.length} oficinas registradas</p>
        </div>
        <div className="pl-actions-group">
          <button className="pl-btn-action" onClick={handleOpenCreate}>
            <Plus size={16} /> Nueva Oficina
          </button>
          <button className="pl-btn-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="pl-toolbar">
        <div className="pl-search-wrapper">
          <Search size={16} />
          <input
            placeholder="BUSCAR OFICINA..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value.toUpperCase());
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Tabla de Oficinas con etiquetas responsive */}
      <div className="pl-table-frame">
        <table className="pl-data-table">
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>ID</th>
              <th style={{ textAlign: "left", paddingLeft: "1.5rem" }}>
                Nombre
              </th>
              <th>Zona</th>
              <th>Estado</th>
              <th style={{ textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentOffices.length > 0 ? (
              currentOffices.map((office) => (
                <tr key={office.id}>
                  <td
                    className="pl-sku-cell"
                    data-label="ID"
                    style={{ textAlign: "center" }}
                  >
                    #{office.id}
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
                    {office.nombre.toUpperCase()}
                  </td>
                  <td data-label="Zona">{office.nombre_zona?.toUpperCase()}</td>
                  <td data-label="Estado">
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
                        setSelectedOffice(office);
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
                  colSpan="5"
                  className="no-results"
                  style={{ padding: "2rem", textAlign: "center" }}
                >
                  No se encontraron oficinas
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
      {/* MODAL FORMULARIO (CREAR/EDITAR) */}
      <OfficesFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        office={selectedOffice}
      />

      {/* DELETE MODAL */}
      {isDeleteModalOpen && selectedOffice && (
        <div className="pl-modal-overlay">
          <div className="pl-modal-box">
            <div className="pl-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--pl-danger)' }}>
              <AlertTriangle size={24} />
              <span>Delete Office?</span>
            </div>
            <p style={{ margin: '1rem 0', color: 'var(--pl-text-main)' }}>
              Are you sure you want to delete{" "}
              <strong>{selectedOffice.nombre.toUpperCase()}</strong>?
            </p>
            <div className="pl-modal-footer">
              <button
                className="pl-btn-secondary-outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button className="pl-btn-danger-soft" onClick={handleDelete}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {isDetailsModalOpen && selectedOffice && (
        <div className="pl-modal-overlay">
          <div className="pl-modal-box">
            <h3 className="pl-modal-title">DETALLES DE OFICINA</h3>
            
            <div className="pl-info-list">
              <div className="pl-info-item">
                <span className="pl-modal-label" style={{ margin: 0 }}>ID</span>
                <span style={{ fontWeight: 600 }}>#{selectedOffice.id}</span>
              </div>
              <div className="pl-info-item">
                <span className="pl-modal-label" style={{ margin: 0 }}>Nombre</span>
                <span style={{ fontWeight: 600 }}>{selectedOffice.nombre.toUpperCase()}</span>
              </div>
              <div className="pl-info-item">
                <span className="pl-modal-label" style={{ margin: 0 }}>Zona</span>
                <span style={{ fontWeight: 600 }}>{selectedOffice.nombre_zona?.toUpperCase()}</span>
              </div>
              <div className="pl-info-item">
                <span className="pl-modal-label" style={{ margin: 0 }}>Depósito</span>
                <span style={{ fontWeight: 600 }}>{selectedOffice.nombre_deposito?.toUpperCase()}</span>
              </div>
            </div>

            <div className="pl-modal-footer-stack">
              <button
                className="pl-btn-secondary"
                onClick={() => handleOpenEdit(selectedOffice)}
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

export default ListOffices;
