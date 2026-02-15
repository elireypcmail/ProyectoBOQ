import React, { useEffect, useState, useMemo } from "react";
import { useHealth } from "../../context/HealtContext";
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

// 1. Importar PhoneInput y sus estilos
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import "../../styles/components/ListZone.css";

const ListInsurances = () => {
  const {
    seguros,
    getAllSeguros,
    createNewSeguro,
    editedSeguro,
    deleteSeguroById
  } = useHealth();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modales
  const [selectedSeguro, setSelectedSeguro] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Form
  const [editName, setEditName] = useState("");
  const [editContacto, setEditContacto] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editEstatus, setEditEstatus] = useState(true);

  useEffect(() => {
    getAllSeguros();
  }, []);

  // Filtrado y paginación
  const filteredSeguros = useMemo(() => {
    return seguros.filter(s =>
      s.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [seguros, searchTerm]);

  const totalPages = Math.ceil(filteredSeguros.length / itemsPerPage);
  const currentSeguros = filteredSeguros.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------- FORMATOS ----------------
  const handleNameInput = (value, setter) => {
    setter(value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase());
  };

  // -------------------- Acciones --------------------
  const openEditModal = (seguro) => {
    setSelectedSeguro(seguro);
    setEditName(seguro.nombre);
    setEditContacto(seguro.contacto || "");
    setEditTelefono(seguro.telefono || "");
    setEditEstatus(seguro.estatus ?? true);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (seguro) => {
    setSelectedSeguro(seguro);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!editName.trim()) return;
    await createNewSeguro({
      nombre: editName.trim(),
      contacto: editContacto.trim(),
      telefono: editTelefono, // Valor capturado por PhoneInput
      estatus: true 
    });
    setIsCreateModalOpen(false);
    resetForm();
    getAllSeguros();
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !selectedSeguro) return;
    await editedSeguro(selectedSeguro.id, {
      nombre: editName.trim(),
      contacto: editContacto.trim(),
      telefono: editTelefono,
      estatus: editEstatus
    });
    setIsEditModalOpen(false);
    setSelectedSeguro(null);
    resetForm();
    getAllSeguros();
  };

  const handleDelete = async () => {
    if (!selectedSeguro) return;
    await deleteSeguroById(selectedSeguro.id);
    setIsDeleteModalOpen(false);
    setSelectedSeguro(null);
    getAllSeguros();
  };

  const resetForm = () => {
    setEditName("");
    setEditContacto("");
    setEditTelefono("");
    setEditEstatus(true);
  };

  // -------------------- Render --------------------
  return (
    <div className="orders-container">
      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Seguros</h2>
          <p>Total seguros: {filteredSeguros.length}</p>
        </div>
        <button className="btn-primary" onClick={() => {
          resetForm();
          setIsCreateModalOpen(true);
        }}>
          <Plus size={16} /> Nuevo Seguro
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar seguro..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value.toUpperCase()); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th className="hide-mobile">Contacto</th>
              <th className="hide-mobile">Teléfono</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentSeguros.length > 0 ? currentSeguros.map(s => (
              <tr key={s.id}>
                <td>#{s.id}</td>
                <td>{s.nombre}</td>
                <td className="hide-mobile">{s.contacto || "-"}</td>
                <td className="hide-mobile">{s.telefono ? `+${s.telefono}` : "-"}</td>
                <td className="center">
                  <button className="icon-btn" onClick={() => { setSelectedSeguro(s); setIsDetailsModalOpen(true); }}>
                    <SlOptionsVertical size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="no-results">No se encontraron seguros</td>
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

      {/* MODAL CREAR / EDITAR */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isCreateModalOpen ? "Crear Seguro" : "Editar Seguro"}</h3>
            
            <label className="modal-label">Nombre de la Aseguradora</label>
            <input
              className="modal-input"
              placeholder="Ej: SEGUROS CARACAS"
              value={editName}
              onChange={e => handleNameInput(e.target.value, setEditName)}
            />
            
            <label className="modal-label">Persona de Contacto</label>
            <input
              className="modal-input"
              placeholder="Ej: JUAN PÉREZ"
              value={editContacto}
              onChange={e => handleNameInput(e.target.value, setEditContacto)}
            />
            
            <label className="modal-label">Teléfono de Atención</label>
            <div className="phone-input-container" style={{ marginBottom: '15px' }}>
              <PhoneInput
                country={'ve'}
                value={editTelefono}
                onChange={value => setEditTelefono(value)}
                inputStyle={{
                  width: '100%',
                  height: '45px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}
                buttonStyle={{
                  borderRadius: '8px 0 0 8px',
                  border: '1px solid #e2e8f0'
                }}
              />
            </div>
            
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={isCreateModalOpen ? handleCreate : handleUpdate}>
                <Save size={16} /> {isCreateModalOpen ? "Crear" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedSeguro && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalles de {selectedSeguro.nombre}</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> <span>#{selectedSeguro.id}</span></div>
              <div className="detail-card"><strong>Nombre:</strong> <span>{selectedSeguro.nombre}</span></div>
              <div className="detail-card"><strong>Contacto:</strong> <span>{selectedSeguro.contacto || "-"}</span></div>
              <div className="detail-card"><strong>Teléfono:</strong> <span>{selectedSeguro.telefono ? `+${selectedSeguro.telefono}` : "-"}</span></div>
            </div>
            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn-primary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedSeguro); }}>
                <Pencil size={16} /> Editar
              </button>
              <button className="btn-danger" onClick={() => { setIsDetailsModalOpen(false); openDeleteModal(selectedSeguro); }}>
                <Trash2 size={16} /> Eliminar
              </button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedSeguro && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar seguro?</h3>
            </div>
            <p>Confirma que deseas eliminar <strong>{selectedSeguro.nombre}</strong></p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDelete}><Trash2 size={16} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListInsurances;