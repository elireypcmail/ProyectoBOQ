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
    <div className="insurances-view-container">
      {/* HEADER */}
      <div className="insurances-main-header">
        <div>
          <h2 className="insurances-title">GESTIÓN DE SEGUROS</h2>
          <p className="insurances-subtitle">
            {filteredSeguros.length} EMPRESAS REGISTRADAS
          </p>
        </div>
        <button className="insurances-btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> <span>NUEVO SEGURO</span>
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="insurances-filter-toolbar">
        <div className="insurances-search-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="insurances-search-input"
            placeholder="BUSCAR POR NOMBRE..."
            style={{ textTransform: 'uppercase' }}
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value.toUpperCase()); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="insurances-table-responsive">
        <table className="insurances-data-table">
          <tbody>
            {currentSeguros.length > 0 ? currentSeguros.map(s => (
              <tr key={s.id} className="insurances-table-row">
                <td className="insurances-td-id">#{s.id}</td>
                <td>
                  <div className="ins-main-info">
                    <span className="ins-name bold">{s.nombre.toUpperCase()}</span>
                    <span className="ins-subtext">
                      <User size={12} style={{marginRight: '4px'}}/>
                      {s.contacto?.toUpperCase() || "SIN CONTACTO"}
                    </span>
                  </div>
                </td>
                <td className="insurances-hide-mobile">
                  <div className="ins-main-info">
                    <span className="ins-subtext" style={{fontWeight: 700}}>SOPORTE</span>
                    <span className="ins-name" style={{fontSize: '0.9rem'}}>
                      <Phone size={12} style={{marginRight: '4px'}}/>
                      {s.telefono ? `+${s.telefono}` : "---"}
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                    <button className="insurances-action-pill" onClick={() => openEditModal(s)}>
                      <Settings2 size={16} />
                      <span className="insurances-hide-mobile">GESTIONAR</span>
                    </button>
                    <button 
                      className="insurances-action-pill" 
                      style={{color: 'var(--ins-danger)'}}
                      onClick={() => { setSelectedSeguro(s); setIsDeleteModalOpen(true); }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{textAlign: 'center', padding: '3rem'}}>
                  NO SE ENCONTRARON RESULTADOS
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="insurances-pagination-bar">
          <button 
            className="insurances-page-btn" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft size={20} />
          </button>
          <span>PÁGINA {currentPage} DE {totalPages}</span>
          <button 
            className="insurances-page-btn" 
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
        <div className="insurances-modal-overlay">
          <div className="insurances-modal-card" style={{maxWidth:'400px', textAlign:'center'}}>
            <AlertTriangle size={48} style={{margin:'0 auto 1rem', color: 'orange'}} />
            <h3 className="insurances-modal-title">¿ELIMINAR SEGURO?</h3>
            <p>CONFIRMA QUE DESEAS ELIMINAR: <br/><strong>{selectedSeguro.nombre.toUpperCase()}</strong></p>
            <div style={{display:'flex', flexDirection:'column', gap:'0.75rem', marginTop:'1.5rem'}}>
              <button className="insurances-btn-danger" onClick={handleDelete}>
                SÍ, ELIMINAR
              </button>
              <button className="insurances-btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
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