import React, { useEffect, useState, useMemo } from "react";
import { useHealth } from "../../context/HealtContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertTriangle,
  Plus,
  Phone,
  User,
  Settings2
} from "lucide-react";
import InsuranceFormModal from "./ui/InsuranceFormModal";
import "../../styles/components/ListInsurances.css";

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

  const [selectedSeguro, setSelectedSeguro] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
    estatus: true
  });

  useEffect(() => { 
    getAllSeguros(); 
  }, []);

  // -------------------- Filtrado y Ordenación Alfabética --------------------
  const filteredSeguros = useMemo(() => {
    const list = seguros || [];
    
    // 1. Filtrar
    const filtered = list.filter(s => 
      s.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );

    // 2. Ordenar A-Z por Nombre
    return [...filtered].sort((a, b) => {
      const nameA = (a.nombre || "").toUpperCase();
      const nameB = (b.nombre || "").toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }, [seguros, searchTerm]);

  const totalPages = Math.ceil(filteredSeguros.length / itemsPerPage);
  const currentSeguros = filteredSeguros.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers de Formulario
  const handleNameInput = (value, setter) => {
    // Solo letras y espacios, forzado a MAYÚSCULAS
    setter(value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase());
  };

  const resetForm = () => {
    setFormData({ nombre: "", contacto: "", telefono: "", estatus: true });
    setSelectedSeguro(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (seguro) => {
    setSelectedSeguro(seguro);
    setFormData({
      nombre: seguro.nombre.toUpperCase(),
      contacto: (seguro.contacto || "").toUpperCase(),
      telefono: seguro.telefono || "",
      estatus: seguro.estatus ?? true
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) return;

    // Aseguramos mayúsculas antes de enviar al servidor
    const payload = {
      ...formData,
      nombre: formData.nombre.toUpperCase(),
      contacto: formData.contacto.toUpperCase()
    };

    if (selectedSeguro) {
      await editedSeguro(selectedSeguro.id, payload);
    } else {
      await createNewSeguro(payload);
    }
    
    setIsModalOpen(false);
    getAllSeguros();
  };

  const handleDelete = async () => {
    if (!selectedSeguro) return;
    await deleteSeguroById(selectedSeguro.id);
    setIsDeleteModalOpen(false);
    setSelectedSeguro(null);
    getAllSeguros();
  };

  return (
    <div className="is-main-container">
      {/* HEADER */}
      <div className="is-header-section">
        <div className="is-title-group">
          <h2>Gestión de Seguros</h2>
          <p>{filteredSeguros.length} EMPRESAS REGISTRADAS</p>
        </div>
        <button className="is-btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> NUEVO SEGURO
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="is-toolbar">
        <div className="is-search-box">
          <Search size={18} style={{ color: 'var(--is-muted)' }} />
          <input
            type="text"
            placeholder="BUSCAR SEGURO..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value.toUpperCase()); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="is-table-frame">
        <table className="is-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th style={{ textAlign: 'left' }}>Aseguradora</th>
              <th className="is-hide-mobile">Soporte</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentSeguros.length > 0 ? currentSeguros.map(s => (
              <tr key={s.id}>
                <td data-label="ID" className="is-id-text">#{s.id}</td>
                
                <td data-label="Aseguradora" style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>{s.nombre.toUpperCase()}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--is-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} /> {s.contacto?.toUpperCase() || "SIN CONTACTO"}
                    </span>
                  </div>
                </td>

                <td data-label="Soporte" className="is-hide-mobile">
                  <span className="is-badge-support">
                    <Phone size={12} /> {s.telefono ? `+${s.telefono}` : "---"}
                  </span>
                </td>

                <td data-label="Acciones">
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button className="is-btn-pill" onClick={() => openEditModal(s)}>
                      <Settings2 size={16} /> <span className="is-hide-mobile">GESTIONAR</span>
                    </button>
                    <button 
                      className="is-btn-pill danger" 
                      onClick={() => { setSelectedSeguro(s); setIsDeleteModalOpen(true); }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ padding: '3rem', color: 'var(--is-muted)', fontWeight: 600 }}>
                  NO SE ENCONTRARON RESULTADOS
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="is-pagination">
          <button 
            className="is-page-node" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft size={20} />
          </button>
          
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--is-secondary)' }}>
            {currentPage} / {totalPages}
          </span>

          <button 
            className="is-page-node" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
      {/* MODAL DE FORMULARIO */}
      <InsuranceFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSeguro ? "EDITAR SEGURO" : "NUEVO SEGURO"}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        handleNameInput={handleNameInput}
      />

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedSeguro && (
        <div className="is-modal-overlay">
          <div className="is-modal-box delete-confirm">
            <div className="is-modal-icon-header">
              <AlertTriangle size={48} />
            </div>
            
            <h3 className="is-modal-title">¿ELIMINAR SEGURO?</h3>
            
            <p className="is-modal-text">
              Esta acción no se puede deshacer. Confirma que deseas eliminar a: <br/>
              <strong>{selectedSeguro.nombre.toUpperCase()}</strong>
            </p>

            <div className="is-modal-footer-stack">
              <button className="is-btn-danger" onClick={handleDelete}>
                <Trash2 size={18} /> SÍ, ELIMINAR REGISTRO
              </button>
              <button className="is-btn-secondary-outline" onClick={() => setIsDeleteModalOpen(false)}>
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListInsurances;