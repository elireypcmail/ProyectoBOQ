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

const ListZones = () => {
  const { entities, getAllEntities, editedEntity, deleteEntityById, createNewEntity } = useEntity();

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
    const formatted = value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase();
    setter(formatted);
  };

  const filteredZones = useMemo(() => {
    return zones.filter(zone =>
      zone.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [zones, searchTerm]);

  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);
  const currentZones = filteredZones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------- Acciones --------------------
  const openEditModal = (zone) => {
    setSelectedZone(zone);
    setEditName(zone.nombre);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (zone) => {
    setSelectedZone(zone);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!editName.trim()) return;
    try {
      await createNewEntity("zonas", { nombre: editName.trim() });
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
      await editedEntity("zonas", selectedZone.id, { nombre: editName.trim() });
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
    <div className="orders-container">
      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Gestión de Zonas</h2>
          <p>{filteredZones.length} zonas registradas</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} /> Nueva Zona
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Buscar zona..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
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
              <th className="hide-mobile">Estado</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentZones.length > 0 ? (
              currentZones.map(zone => (
                <tr key={zone.id}>
                  <td className="id hide-mobile">#{zone.id}</td>
                  <td>{zone.nombre}</td>
                  <td className="hide-mobile"><span className="badge active">Activo</span></td>
                  <td className="center">
                    <div className="actions-desktop">
                      <button className="icon-btn edit" onClick={() => openEditModal(zone)}>
                        <Pencil size={16} />
                      </button>
                      <button className="icon-btn delete" onClick={() => openDeleteModal(zone)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="actions-mobile">
                      <button className="icon-btn" onClick={() => { setSelectedZone(zone); setIsDetailsModalOpen(true); }}>
                        &#8942;
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-results">No se encontraron zonas</td>
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

      {/* MODAL CREAR / EDITAR */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isCreateModalOpen ? "Crear Zona" : "Editar Zona"}</h3>
            <input
              className="modal-input"
              placeholder="Nombre de la zona"
              value={editName}
              onChange={(e) => handleNameInput(e.target.value, setEditName)}
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setEditName("");
              }}>Cancelar</button>
              <button className="btn-primary" onClick={isCreateModalOpen ? handleCreate : handleUpdate}>
                <Save size={16} /> {isCreateModalOpen ? "Crear" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedZone && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar zona?</h3>
            </div>
            <p>Confirma que deseas eliminar <strong>{selectedZone.nombre}</strong></p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDelete}><Trash2 size={16} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES MÓVIL */}
      {isDetailsModalOpen && selectedZone && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalles de {selectedZone.nombre}</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> <span>#{selectedZone.id}</span></div>
              <div className="detail-card"><strong>Nombre:</strong> <span>{selectedZone.nombre}</span></div>
              <div className="detail-card"><strong>Estado:</strong> <span>Activo</span></div>
            </div>

            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn-primary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedZone); }}><Pencil size={16} /> Editar</button>
              <button className="btn-danger" onClick={() => { setIsDetailsModalOpen(false); openDeleteModal(selectedZone); }}><Trash2 size={16} /> Eliminar</button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListZones;
