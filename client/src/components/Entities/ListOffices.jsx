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
import OfficesFormModal from "./ui/OfficesFormModal"; 
import "../../styles/components/ListZone.css";

const ListOffices = () => {
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
      office.nombre.toUpperCase().includes(searchTerm.toUpperCase())
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
    currentPage * itemsPerPage
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
    <div className="orders-container">
      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Gestión de Oficinas</h2>
          <p>{filteredOffices.length} oficinas registradas</p>
        </div>
        <button className="btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Nueva Oficina
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="BUSCAR OFICINA..."
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
              <th className="hide-mobile">Zona</th>
              <th className="hide-mobile">Estado</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentOffices.length > 0 ? currentOffices.map((office) => (
              <tr key={office.id}>
                <td className="id hide-mobile">#{office.id}</td>
                <td className="bold">{office.nombre.toUpperCase()}</td>
                <td className="hide-mobile">{office.nombre_zona?.toUpperCase()}</td>
                <td className="hide-mobile">
                  <span className="badge active">ACTIVO</span>
                </td>
                <td className="center">
                  <button className="icon-btn edit" onClick={() => { setSelectedOffice(office); setIsDetailsModalOpen(true); }}>
                    <SlOptionsVertical size={16}/>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="no-results">No se encontraron oficinas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="orders-pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18} /></button>
          <span>Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18} /></button>
        </div>
      )}

      {/* MODAL FORMULARIO (CREAR/EDITAR) */}
      <OfficesFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        office={selectedOffice}
      />

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedOffice && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar oficina?</h3>
            </div>
            <p>Confirma que deseas eliminar <strong>{selectedOffice.nombre.toUpperCase()}</strong></p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDelete}><Trash2 size={16} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedOffice && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>DETALLES DE OFICINA</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> <span>#{selectedOffice.id}</span></div>
              <div className="detail-card"><strong>Nombre:</strong> <span>{selectedOffice.nombre.toUpperCase()}</span></div>
              <div className="detail-card"><strong>Zona:</strong> <span>{selectedOffice.nombre_zona?.toUpperCase()}</span></div>
              <div className="detail-card"><strong>Depósito:</strong> <span>{selectedOffice.nombre_deposito?.toUpperCase()}</span></div>
            </div>

            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn-primary" onClick={() => handleOpenEdit(selectedOffice)}><Pencil size={16} /> Editar</button>
              <button className="btn-danger" onClick={() => { setIsDetailsModalOpen(false); setIsDeleteModalOpen(true); }}><Trash2 size={16} /> Eliminar</button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOffices;