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
  X
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import "../../styles/components/ListZone.css";

const ListBrands = ({onClose}) => {
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
    <div className="pl-main-container">
{/* HEADER */}
      <div className="pl-header-section">
        <div className="pl-title-group">
          <h2>GESTIÓN DE MARCAS</h2>
          <p>{filteredBrands.length} MARCAS REGISTRADAS</p>
        </div>

        <div className="pl-actions-group">
          <button 
            className="pl-btn-action" 
            onClick={() => { setEditName(""); setIsCreateModalOpen(true); }}
          >
            <Plus size={16} /> NUEVA MARCA
          </button>

          {onClose && (
            <button 
              className="pl-btn-close" 
              onClick={onClose}
              title="Cerrar ventana"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="pl-toolbar">
        <div className="pl-search-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="BUSCAR MARCA..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value.toUpperCase()); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="pl-table-frame">
        <table className="pl-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NOMBRE</th>
              <th>ESTATUS</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentBrands.length > 0 ? (
              currentBrands.map(brand => (
                <tr key={brand.id}>
                  <td data-label="ID" className="pl-sku-cell">#{brand.id}</td>
                  
                  {/* Agregamos el atributo title para accesibilidad */}
                  <td 
                    data-label="NOMBRE" 
                    style={{ fontWeight: 700 }} 
                    title={(brand.nombre || "").toUpperCase()}
                  >
                    {(brand.nombre || "").toUpperCase()}
                  </td>
                  
                  <td data-label="ESTATUS">ACTIVO</td>
                  <td data-label="ACCIONES">
                    <button className="pl-icon-only-btn" onClick={() => { setSelectedBrand(brand); setIsDetailsModalOpen(true); }}>
                      <SlOptionsVertical size={16}/>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', color: 'var(--pl-muted)' }}>
                  NO SE ENCONTRARON RESULTADOS
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="pl-pagination-area">
          <button className="pl-page-node" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontWeight: 600 }}>{currentPage} / {totalPages}</span>
          <button className="pl-page-node" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="pl-modal-overlay">
          <div className="pl-modal-box">
            <h3 className="pl-modal-title">
              {isCreateModalOpen ? "CREAR NUEVA MARCA" : "EDITAR MARCA"}
            </h3>
            <div className="pl-modal-body">
              <label className="pl-modal-label">NOMBRE DE LA MARCA</label>
              <input 
                placeholder="EJ. NIKE, ADIDAS..."
                className="pl-modal-input" 
                style={{ textTransform: 'uppercase' }}
                value={editName} 
                onChange={(e) => handleNameInput(e.target.value, setEditName)} 
              />
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn-secondary-outline" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}>
                CANCELAR
              </button>
              <button className="pl-btn-action" onClick={isCreateModalOpen ? handleCreate : handleUpdate}>
                <Save size={16} /> {isCreateModalOpen ? "CREAR MARCA" : "GUARDAR CAMBIOS"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedBrand && (
        <div className="pl-modal-overlay">
          <div className="pl-modal-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--pl-primary)', marginBottom: '1rem' }}>
              <AlertTriangle size={28} />
              <h3 style={{ margin: 0, fontWeight: 800 }}>¿ELIMINAR REGISTRO?</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--pl-muted)', lineHeight: '1.5' }}>
              ¿Estás seguro de que deseas eliminar la marca <strong>{(selectedBrand?.nombre || "").toUpperCase()}</strong>? 
              Esta acción es irreversible y podría afectar a los productos asociados.
            </p>
            <div className="pl-modal-footer">
              <button className="pl-btn-secondary-outline" onClick={() => setIsDeleteModalOpen(false)}>
                CANCELAR
              </button>
              <button className="pl-btn-action" onClick={handleDelete}>
                <Trash2 size={16} /> CONFIRMAR ELIMINAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedBrand && (
        <div className="pl-modal-overlay">
          <div className="pl-modal-box">
            <h3 className="pl-modal-title">DETALLES DE MARCA</h3>
            <div className="pl-info-list">
              <div className="pl-info-item">
                <strong style={{ fontSize: '0.75rem', color: 'var(--pl-muted)' }}>ID INTERNO</strong> 
                <span className="pl-sku-cell">#{selectedBrand.id}</span>
              </div>
              <div className="pl-info-item">
                <strong style={{ fontSize: '0.75rem', color: 'var(--pl-muted)' }}>NOMBRE</strong> 
                <span style={{ fontWeight: 700 }}>{(selectedBrand?.nombre || "").toUpperCase()}</span>
              </div>
              <div className="pl-info-item">
                <strong style={{ fontSize: '0.75rem', color: 'var(--pl-muted)' }}>ESTADO</strong> 
                <span style={{ color: '#10b981', fontWeight: 700 }}>ACTIVO</span>
              </div>
            </div>
            <div className="pl-modal-footer-stack">
              <button className="pl-btn-secondary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedBrand); }}>
                <Pencil size={16} /> EDITAR INFORMACIÓN
              </button>
              <button className="pl-btn-danger-soft" onClick={() => { setIsDetailsModalOpen(false); openDeleteModal(selectedBrand); }}>
                <Trash2 size={16} /> ELIMINAR REGISTRO
              </button>
              <button className="pl-btn-secondary-outline" onClick={() => setIsDetailsModalOpen(false)}>
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListBrands;