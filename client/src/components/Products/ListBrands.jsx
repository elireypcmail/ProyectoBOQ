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
  const itemsPerPage = 10;

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

  // -------------------- Filtrado y Ordenación Alfabética --------------------
  const filteredBrands = useMemo(() => {
    // 1. Filtrar
    const filtered = brands.filter(b =>
      (b.nombre || "").toUpperCase().includes(searchTerm.toUpperCase())
    );

    // 2. Ordenar A-Z
    return [...filtered].sort((a, b) => {
      const nameA = (a.nombre || "").toUpperCase();
      const nameB = (b.nombre || "").toUpperCase();
      return nameA.localeCompare(nameB);
    });
  }, [brands, searchTerm]);

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const currentBrands = filteredBrands.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------- Acciones --------------------
  const openEditModal = (brand) => {
    setSelectedBrand(brand);
    setEditName(brand.nombre.toUpperCase());
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (brand) => {
    setSelectedBrand(brand);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!editName.trim()) return;
    try {
      await createNewEntity("marcas", { nombre: editName.trim().toUpperCase() });
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
      await editedEntity("marcas", selectedBrand.id, { nombre: editName.trim().toUpperCase() });
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
          <h2>GESTIÓN DE MARCAS</h2>
          <p>{filteredBrands.length} MARCAS REGISTRADAS</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditName(""); setIsCreateModalOpen(true); }}>
          <Plus size={16} /> NUEVA MARCA
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="BUSCAR MARCA..."
            style={{ textTransform: 'uppercase' }}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value.toUpperCase()); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th className="hide-mobile">ID</th>
              <th>NOMBRE</th>
              <th className="hide-mobile">ESTATUS</th>
              <th className="center">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentBrands.length > 0 ? (
              currentBrands.map(brand => (
                <tr key={brand.id}>
                  <td className="id hide-mobile">#{brand.id}</td>
                  <td className="bold">{brand.nombre.toUpperCase()}</td>
                  <td className="hide-mobile">
                    <span className="badge active">ACTIVO</span>
                  </td>
                  <td className="center">
                    <button className="icon-btn" onClick={() => { setSelectedBrand(brand); setIsDetailsModalOpen(true); }}>
                      <SlOptionsVertical size={16}/>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-results">NO SE ENCONTRARON RESULTADOS</td>
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
          <span>PÁGINA {currentPage} DE {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODAL CREAR */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>CREAR MARCA</h3>
            <input
              placeholder="NOMBRE"
              className="modal-input" 
              style={{ textTransform: 'uppercase' }}
              value={editName} 
              onChange={(e) => handleNameInput(e.target.value, setEditName)} 
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>CANCELAR</button>
              <button className="btn-primary" onClick={handleCreate}><Save size={16} /> CREAR</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {isEditModalOpen && selectedBrand && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>EDITAR MARCA</h3>
            <input
              placeholder="NOMBRE"
              className="modal-input" 
              style={{ textTransform: 'uppercase' }}
              value={editName} 
              onChange={(e) => handleNameInput(e.target.value, setEditName)} 
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>CANCELAR</button>
              <button className="btn-primary" onClick={handleUpdate}><Save size={16} /> GUARDAR</button>
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
              <h3>¿ELIMINAR MARCA?</h3>
            </div>
            <p>CONFIRMA QUE DESEAS ELIMINAR: <br/><strong>{selectedBrand.nombre.toUpperCase()}</strong></p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>CANCELAR</button>
              <button className="btn-danger" onClick={handleDelete}><Trash2 size={16} /> ELIMINAR</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedBrand && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>DETALLES DE MARCA</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> <span>#{selectedBrand.id}</span></div>
              <div className="detail-card"><strong>NOMBRE:</strong> <span className="bold">{selectedBrand.nombre.toUpperCase()}</span></div>
              <div className="detail-card"><strong>ESTADO:</strong> <span>ACTIVO</span></div>
            </div>
            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn-primary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedBrand); }}><Pencil size={16} /> EDITAR</button>
              <button className="btn-danger" onClick={() => { setIsDetailsModalOpen(false); openDeleteModal(selectedBrand); }}><Trash2 size={16} /> ELIMINAR</button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>CERRAR</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListBrands;