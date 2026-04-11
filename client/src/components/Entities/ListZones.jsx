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
  Plus,
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import "../../styles/components/ListZone.css";

const ListZones = () => {
  const {
    entities,
    getAllEntities,
    editedEntity,
    deleteEntityById,
    createNewEntity,
  } = useEntity();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modales
  const [selectedZone, setSelectedZone] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editName, setEditName] = useState("");

  const zones = entities.zonas || [];

  useEffect(() => {
    getAllEntities("zonas");
  }, []);

  // -------------------- Función de formateo --------------------
  const handleNameInput = (value, setter) => {
    // Mantiene solo letras y espacios, forzando mayúsculas
    const formatted = value
      .replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "")
      .toUpperCase();
    setter(formatted);
  };

  // Filtrado y Ordenación Alfabética
  const filteredZones = useMemo(() => {
    const list = zones || [];

    // 1. Filtrar
    const filtered = list.filter((zone) =>
      zone.nombre.toUpperCase().includes(searchTerm.toUpperCase()),
    );

    // 2. Ordenar A-Z
    return [...filtered].sort((a, b) => {
      const nameA = (a.nombre || "").toUpperCase();
      const nameB = (b.nombre || "").toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }, [zones, searchTerm]);

  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);
  const currentZones = filteredZones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // -------------------- Acciones --------------------
  const openEditModal = (zone) => {
    setSelectedZone(zone);
    setEditName(zone.nombre.toUpperCase());
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (zone) => {
    setSelectedZone(zone);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!editName.trim()) return;
    try {
      await createNewEntity("zonas", { nombre: editName.trim().toUpperCase() });
      setIsCreateModalOpen(false);
      setEditName("");
      getAllEntities("zonas");
    } catch (error) {
      console.error("Error al crear zona:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !selectedZone) return;
    try {
      await editedEntity("zonas", selectedZone.id, {
        nombre: editName.trim().toUpperCase(),
      });
      setIsEditModalOpen(false);
      setSelectedZone(null);
      setEditName("");
      getAllEntities("zonas");
    } catch (error) {
      console.error("Error al editar zona:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedZone) return;
    try {
      await deleteEntityById("zonas", selectedZone.id);
      setIsDeleteModalOpen(false);
      setSelectedZone(null);
      getAllEntities("zonas");
    } catch (error) {
      console.error("Error al eliminar zona:", error);
    }
  };

  return (
    <div className="pl-main-container">
      {/* Encabezado */}
      <div className="pl-header-section">
        <div className="pl-title-group">
          <h2>Gestión de Zonas</h2>
          <p>{filteredZones.length} zonas registradas</p>
        </div>
        <div className="pl-actions-group">
          <button
            className="pl-btn-action"
            onClick={() => {
              setEditName("");
              setIsCreateModalOpen(true);
            }}
          >
            <Plus size={16} /> Nueva Zona
          </button>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="pl-toolbar">
        <div className="pl-search-wrapper">
          <Search size={16} />
          <input
            placeholder="BUSCAR ZONA..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value.toUpperCase());
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Tabla de Zonas con etiquetas responsive */}
      <div className="pl-table-frame">
        <table className="pl-data-table">
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>ID</th>
              <th style={{ textAlign: "left", paddingLeft: "1.5rem" }}>
                Nombre
              </th>
              <th>Estado</th>
              <th style={{ textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentZones.length > 0 ? (
              currentZones.map((zone) => (
                <tr key={zone.id}>
                  <td
                    className="pl-sku-cell"
                    data-label="ID"
                    style={{ textAlign: "center" }}
                  >
                    #{zone.id}
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
                    {zone.nombre.toUpperCase()}
                  </td>
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
                        setSelectedZone(zone);
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
                  No se encontraron zonas
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

      {/* MODAL CREATE / EDIT */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="pl-modal-overlay">
          <div className="pl-modal-box">
            <h3 className="pl-modal-title">
              {isCreateModalOpen ? "CREATE ZONE" : "EDIT ZONE"}
            </h3>

            <label className="pl-modal-label">ZONE NAME</label>
            <input
              className="pl-modal-input"
              placeholder="E.G. NORTHERN SECTOR"
              value={editName}
              style={{ textTransform: "uppercase" }}
              onChange={(e) => handleNameInput(e.target.value, setEditName)}
            />

            <div className="pl-modal-footer">
              <button
                className="pl-btn-secondary-outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  setEditName("");
                }}
              >
                Cancel
              </button>
              <button
                className="pl-btn-action"
                onClick={isCreateModalOpen ? handleCreate : handleUpdate}
              >
                <Save size={16} /> {isCreateModalOpen ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {isDeleteModalOpen && selectedZone && (
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
              <span>Delete Zone?</span>
            </div>
            <p style={{ margin: "1rem 0", color: "var(--pl-text-main)" }}>
              Are you sure you want to delete{" "}
              <strong>{selectedZone.nombre.toUpperCase()}</strong>?
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

      {/* MODAL DETAILS */}
      {isDetailsModalOpen && selectedZone && (
        <div className="pl-modal-overlay">
          <div className="pl-modal-box">
            <h3 className="pl-modal-title">
              DETALLES DE {selectedZone.nombre.toUpperCase()}
            </h3>

            <div className="pl-info-list">
              <div className="pl-info-item">
                <span className="pl-modal-label" style={{ margin: 0 }}>
                  ID
                </span>
                <span style={{ fontWeight: 600 }}>#{selectedZone.id}</span>
              </div>
              <div className="pl-info-item">
                <span className="pl-modal-label" style={{ margin: 0 }}>
                  Nombre
                </span>
                <span style={{ fontWeight: 600 }}>
                  {selectedZone.nombre.toUpperCase()}
                </span>
              </div>
              <div className="pl-info-item">
                <span className="pl-modal-label" style={{ margin: 0 }}>
                  Estado
                </span>
                <span className="badge active">ACTIVO</span>
              </div>
            </div>

            <div className="pl-modal-footer-stack">
              <button
                className="pl-btn-secondary"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  openEditModal(selectedZone);
                }}
              >
                <Pencil size={16} /> Editar
              </button>
              <button
                className="pl-btn-danger-soft"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  openDeleteModal(selectedZone);
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

export default ListZones;
