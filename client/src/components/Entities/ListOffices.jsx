import React, { useEffect, useState, useMemo } from "react";
import { useEntity } from "../../context/EntityContext";
// 1. Importar react-select
import Select from "react-select";
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
import { SlOptionsVertical } from "react-icons/sl"
import "../../styles/components/ListZone.css";

const ListOffices = () => {
  const { entities, getAllEntities, createNewEntity, editedEntity, deleteEntityById } = useEntity();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modales
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");

  // Crear zona al vuelo
  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");

  const offices = entities.oficinas || [];
  const zones = entities.zonas || [];

  useEffect(() => {
    getAllEntities("oficinas");
    getAllEntities("zonas");
  }, []);

  // 2. Mapear opciones para react-select
  const zoneOptions = useMemo(() => 
    zones.map(z => ({ value: z.id, label: z.nombre })), 
  [zones]);

  // Estilos básicos para integrar con tu CSS
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '8px',
      borderColor: '#e2e8f0',
      minHeight: '45px',
      fontSize: '14px'
    }),
    container: (base) => ({
      ...base,
      flex: 1
    })
  };

  // 3. Función de formateo ajustada (Permite todo + Mayúsculas)
  const handleNameInput = (value, setter) => {
    setter(value.toUpperCase());
  };

  const filteredOffices = useMemo(() => {
    return offices.filter((office) =>
      office.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [offices, searchTerm]);

  const totalPages = Math.ceil(filteredOffices.length / itemsPerPage);
  const currentOffices = filteredOffices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------- Acciones --------------------
  const openEditModal = (office) => {
    setSelectedOffice(office);
    setEditName(office.nombre);
    setSelectedZoneId(office.id_zona);
    setIsEditModalOpen(true);
    setIsCreatingZone(false);
    setNewZoneName("");
  };

  const openDeleteModal = (office) => {
    setSelectedOffice(office);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!editName.trim() || !selectedZoneId) return;
    try {
      await createNewEntity("oficinas", { nombre: editName.trim(), id_zona: selectedZoneId });
      setIsCreateModalOpen(false);
      setEditName("");
      setSelectedZoneId("");
      getAllEntities("oficinas");
    } catch (error) {
      console.error("Error al crear oficina:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !selectedZoneId || !selectedOffice) return;
    try {
      await editedEntity("oficinas", selectedOffice.id, { nombre: editName.trim(), id_zona: selectedZoneId });
      setIsEditModalOpen(false);
      setSelectedOffice(null);
      setEditName("");
      setSelectedZoneId("");
      getAllEntities("oficinas");
    } catch (error) {
      console.error("Error al editar oficina:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedOffice) return;
    try {
      await deleteEntityById("oficinas", selectedOffice.id);
      setIsDeleteModalOpen(false);
      setSelectedOffice(null);
      getAllEntities("oficinas");
    } catch (error) {
      console.error("Error al eliminar oficina:", error);
    }
  };

  const handleCreateZone = async () => {
    if (!newZoneName.trim()) return;
    try {
      const res = await createNewEntity("zonas", { nombre: newZoneName.trim() });
      setSelectedZoneId(res.data.id);
      setIsCreatingZone(false);
      setNewZoneName("");
      getAllEntities("zonas");
    } catch (error) {
      console.error("Error al crear zona:", error);
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
        <button className="btn-primary" onClick={() => { setEditName(""); setSelectedZoneId(""); setIsCreateModalOpen(true); }}>
          <Plus size={16} /> Nueva Oficina
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Buscar oficina..."
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
              <th className="hide-mobile">Zona</th>
              <th className="hide-mobile">Estado</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentOffices.length > 0 ? currentOffices.map((office) => (
              <tr key={office.id}>
                <td className="id hide-mobile">#{office.id}</td>
                <td>{office.nombre}</td>
                <td className="hide-mobile">{office.nombre_zona}</td>
                <td className="hide-mobile"><span className="badge active">Activo</span></td>
                <td className="center">
                  <div className="actions-desktop">
                    <button className="icon-btn edit" onClick={() => { setSelectedOffice(office); setIsDetailsModalOpen(true); }}>
                      <SlOptionsVertical size={16}/>
                    </button>
                  </div>
                  <div className="actions-mobile">
                    <button className="icon-btn" onClick={() => { setSelectedOffice(office); setIsDetailsModalOpen(true); }}>
                      &#8942;
                    </button>
                  </div>
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
            <h3>{isCreateModalOpen ? "Crear Oficina" : "Editar Oficina"}</h3>

            <input
              className="modal-input"
              placeholder="Nombre de la oficina"
              value={editName}
              onChange={(e) => handleNameInput(e.target.value, setEditName)}
            />

            {!isCreatingZone ? (
              <div className="select-zone-container" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1rem' }}>
                {/* 4. Selector react-select */}
                <Select
                  placeholder="Selecciona una zona"
                  options={zoneOptions}
                  value={zoneOptions.find(opt => opt.value === selectedZoneId)}
                  onChange={(opt) => setSelectedZoneId(opt ? opt.value : "")}
                  styles={customSelectStyles}
                  isSearchable
                />
                <button className="btn-add-zone-primary" onClick={() => setIsCreatingZone(true)} style={{ height: '45px' }}>
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <div className="new-zone-container">
                <label>Nueva Zona</label>
                <div className="new-zone-inputs">
                  <input
                    className="modal-input"
                    placeholder="Nombre de la nueva zona"
                    value={newZoneName}
                    onChange={(e) => handleNameInput(e.target.value, setNewZoneName)}
                  />
                  <button className="btn-primary" onClick={handleCreateZone}><Save size={16} /> Guardar</button>
                  <button className="btn-secondary" onClick={() => { setIsCreatingZone(false); setNewZoneName(""); }}>Cancelar</button>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setEditName("");
                setSelectedZoneId("");
                setIsCreatingZone(false);
                setNewZoneName("");
              }}>Cancelar</button>
              <button className="btn-primary" onClick={isCreateModalOpen ? handleCreate : handleUpdate}><Save size={16} /> {isCreateModalOpen ? "Crear" : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ... (Resto de los modales permanecen igual) ... */}
      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedOffice && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar oficina?</h3>
            </div>
            <p>Confirma que deseas eliminar <strong>{selectedOffice.nombre}</strong></p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDelete}><Trash2 size={16} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES MÓVIL */}
      {isDetailsModalOpen && selectedOffice && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalles de {selectedOffice.nombre}</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> <span>#{selectedOffice.id}</span></div>
              <div className="detail-card"><strong>Nombre:</strong> <span>{selectedOffice.nombre}</span></div>
              <div className="detail-card"><strong>Zona:</strong> <span>{selectedOffice.nombre_zona}</span></div>
              <div className="detail-card"><strong>Estado:</strong> <span>Activo</span></div>
            </div>

            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn-primary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedOffice); }}><Pencil size={16} /> Editar</button>
              <button className="btn-danger" onClick={() => { setIsDetailsModalOpen(false); openDeleteModal(selectedOffice); }}><Trash2 size={16} /> Eliminar</button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOffices;