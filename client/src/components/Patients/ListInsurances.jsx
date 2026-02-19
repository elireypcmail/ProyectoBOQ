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
  Plus,
  Phone,
  User,
  Settings2,
  X
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [editContacto, setEditContacto] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editEstatus, setEditEstatus] = useState(true);

  useEffect(() => { getAllSeguros(); }, []);

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

  const handleNameInput = (value, setter) => {
    setter(value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase());
  };

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

  const resetForm = () => {
    setEditName("");
    setEditContacto("");
    setEditTelefono("");
    setEditEstatus(true);
  };

  const handleCreate = async () => {
    if (!editName.trim()) return;
    await createNewSeguro({
      nombre: editName.trim(),
      contacto: editContacto.trim(),
      telefono: editTelefono,
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

  return (
    <div className="insurances-view-container">
      {/* HEADER */}
      <div className="insurances-main-header">
        <div>
          <h2 className="insurances-title">Seguros Médicos</h2>
          <p className="insurances-subtitle">
            {filteredSeguros.length} empresas registradas
          </p>
        </div>
        <button
          className="insurances-btn-primary"
          onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
        >
          <Plus size={18} /> <span>Nuevo Seguro</span>
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="insurances-filter-toolbar">
        <div className="insurances-search-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="insurances-search-input"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLA ESTILO MODERNO */}
      <div className="insurances-table-responsive">
        <table className="insurances-data-table">
          <tbody>
            {currentSeguros.length > 0 ? currentSeguros.map(s => (
              <tr key={s.id} className="insurances-table-row">
                <td className="insurances-td-id">#{s.id}</td>

                <td>
                  <div className="ins-main-info">
                    <span className="ins-name">{s.nombre}</span>
                    <span className="ins-subtext">
                      <User size={12} style={{marginRight: '4px'}}/>
                      {s.contacto || "Sin contacto"}
                    </span>
                  </div>
                </td>

                <td className="insurances-hide-mobile">
                  <div className="ins-main-info">
                    <span className="ins-subtext" style={{fontWeight: 700}}>
                      Soporte
                    </span>
                    <span className="ins-name" style={{fontSize: '0.9rem'}}>
                      <Phone size={12} style={{marginRight: '4px'}}/>
                      {s.telefono ? `+${s.telefono}` : "---"}
                    </span>
                  </div>
                </td>

                <td>
                  <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                    <button
                      className="insurances-action-pill"
                      onClick={() => openEditModal(s)}
                    >
                      <Settings2 size={16} />
                      <span className="insurances-hide-mobile">Gestionar</span>
                    </button>

                    <button
                      className="insurances-action-pill"
                      style={{color: 'var(--ins-danger)'}}
                      onClick={() => openDeleteModal(s)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{textAlign: 'center', padding: '3rem'}}>
                  No se encontraron resultados
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
          <span>{currentPage} / {totalPages}</span>
          <button
            className="insurances-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="insurances-modal-overlay">
          <div className="insurances-modal-card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <h3 className="insurances-modal-title">
                {isCreateModalOpen ? "Nuevo Seguro" : "Editar Seguro"}
              </h3>
              <button
                onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                style={{background:'none',border:'none',cursor:'pointer'}}
              >
                <X size={24} />
              </button>
            </div>

            <div className="insurances-modal-grid">
              <div className="ins-col-span-2">
                <label>Nombre de la Empresa</label>
                <input
                  className="insurances-modal-input"
                  value={editName}
                  onChange={e => handleNameInput(e.target.value, setEditName)}
                />
              </div>

              <div>
                <label>Persona de Contacto</label>
                <input
                  className="insurances-modal-input"
                  value={editContacto}
                  onChange={e => handleNameInput(e.target.value, setEditContacto)}
                />
              </div>

              <div>
                <label>Teléfono</label>
                <PhoneInput
                  country={'ve'}
                  value={editTelefono}
                  onChange={setEditTelefono}
                  inputStyle={{ width:'100%',height:'45px',borderRadius:'10px' }}
                />
              </div>
            </div>

            <div style={{display:'flex',gap:'1rem',marginTop:'2rem'}}>
              <button
                className="insurances-btn-secondary"
                style={{flex:1}}
                onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
              >
                Cancelar
              </button>
              <button
                className="insurances-btn-primary"
                style={{flex:1}}
                onClick={isCreateModalOpen ? handleCreate : handleUpdate}
              >
                <Save size={18}/> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedSeguro && (
        <div className="insurances-modal-overlay">
          <div className="insurances-modal-card" style={{maxWidth:'400px',textAlign:'center'}}>
            <AlertTriangle size={48} style={{margin:'0 auto 1rem'}} />
            <h3 className="insurances-modal-title">¿Eliminar seguro?</h3>
            <p>
              Confirma que deseas eliminar <strong>{selectedSeguro.nombre}</strong>
            </p>

            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',marginTop:'1.5rem'}}>
              <button className="insurances-btn-danger" onClick={handleDelete}>
                Sí, eliminar
              </button>
              <button className="insurances-btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListInsurances;
