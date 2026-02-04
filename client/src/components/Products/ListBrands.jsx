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
import { SlOptionsVertical } from "react-icons/sl";
import "../../styles/components/ListZone.css";

const ListBrands = () => {
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
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editName, setEditName] = useState("");

  const brands = entities.marcas || [];

  useEffect(() => {
    getAllEntities("marcas");
  }, []);

  // -------------------- Función de formateo --------------------
  const handleNameInput = (value, setter) => {
    const formatted = value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase();
    setter(formatted);
  };

  const filteredBrands = useMemo(() => {
    return brands.filter(b =>
      b.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [brands, searchTerm]);

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const currentBrands = filteredBrands.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------- Acciones --------------------
  const openEditModal = (brand) => {
    setSelectedBrand(brand);
    setEditName(brand.nombre);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (brand) => {
    setSelectedBrand(brand);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!editName.trim()) return;
    try {
      await createNewEntity("marcas", { nombre: editName.trim() });
      setIsCreateModalOpen(false);
      setEditName("");
      getAllEntities("marcas");
    } catch (error) {
      console.error("Error al crear marca:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !selectedBrand) return;
    try {
      await editedEntity("marcas", selectedBrand.id, { nombre: editName.trim() });
      setIsEditModalOpen(false);
      setSelectedBrand(null);
      setEditName("");
      getAllEntities("marcas");
    } catch (error) {
      console.error("Error al editar marca:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedBrand) return;
    try {
      await deleteEntityById("marcas", selectedBrand.id);
      setIsDeleteModalOpen(false);
      setSelectedBrand(null);
      getAllEntities("marcas");
    } catch (error) {
      console.error("Error al eliminar marca:", error);
    }
  };

  return (
    <div className="orders-container">

      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Gestión de Marcas</h2>
          <p>{filteredBrands.length} marcas registradas</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditName(""); setIsCreateModalOpen(true); }}>
          <Plus size={16} /> Nueva Marca
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar marca..."
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
            {currentBrands.length > 0 ? (
              currentBrands.map(brand => (
                <tr key={brand.id}>
                  <td className="id hide-mobile">#{brand.id}</td>
                  <td>{brand.nombre}</td>
                  <td className="hide-mobile">
                    <span className="badge active">Activo</span>
                  </td>
                  <td className="center">
                    <div className="actions-desktop">
                      <button className="icon-btn edit" onClick={() => { setSelectedBrand(brand); setIsDetailsModalOpen(true); }}>
                        <SlOptionsVertical size={16}/>
                      </button>
                    </div>
                    <div className="actions-mobile">
                      <button className="icon-btn" onClick={() => { setSelectedBrand(brand); setIsDetailsModalOpen(true); }}>
                        &#8942;
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-results">No se encontraron marcas</td>
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
            <h3>Crear Marca</h3>
            <input
              placeholder="Nombre"
              className="modal-input" 
              value={editName} 
              onChange={(e) => setEditName(e.target.value.toUpperCase())} 
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate}><Save size={16} /> Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {isEditModalOpen && selectedBrand && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Marca</h3>
            <input
              placeholder="Nombre"
              className="modal-input" 
              value={editName} 
              onChange={(e) => setEditName(e.target.value.toUpperCase())} 
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleUpdate}><Save size={16} /> Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedBrand && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar marca?</h3>
            </div>
            <p>Confirma que deseas eliminar <strong>{selectedBrand.nombre}</strong></p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDelete}><Trash2 size={16} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES MÓVIL */}
      {isDetailsModalOpen && selectedBrand && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalles de {selectedBrand.nombre}</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> <span>#{selectedBrand.id}</span></div>
              <div className="detail-card"><strong>Nombre:</strong> <span>{selectedBrand.nombre}</span></div>
              <div className="detail-card"><strong>Estado:</strong> <span>Activo</span></div>
            </div>
            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn-primary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedBrand); }}><Pencil size={16} /> Editar</button>
              <button className="btn-danger" onClick={() => { setIsDetailsModalOpen(false); openDeleteModal(selectedBrand); }}><Trash2 size={16} /> Eliminar</button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListBrands;
