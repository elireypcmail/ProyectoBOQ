import React, { useEffect, useState, useMemo } from "react";
import { useHealth } from "../../context/HealtContext";
import Select from "react-select";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  Plus,
  User,
  Stethoscope,
  FileText,
  X,
  Settings2
} from "lucide-react";
import "../../styles/components/ListStories.css";

const ListStories = ({ pacienteId }) => {
  const {
    historias,
    pacientes,
    medicos,
    getAllHistorias,
    getAllPacientes,
    getAllMedicos,
    createNewHistoria,
    editedHistoria,
    deleteHistoriaById,
    getHistoriasByPacientes,
  } = useHealth();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selectedHistoria, setSelectedHistoria] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedPacienteId, setSelectedPacienteId] = useState(pacienteId || "");
  const [selectedMedicoId, setSelectedMedicoId] = useState("");
  const [editDetalle, setEditDetalle] = useState("");

  useEffect(() => {
    getAllPacientes();
    getAllMedicos();
    if (pacienteId) {
      getHistoriasByPacientes(pacienteId);
    } else {
      getAllHistorias();
    }
  }, [pacienteId]);

  // Mapeo para react-select
  const pacienteOptions = useMemo(() => 
    pacientes.map(p => ({ value: p.id, label: p.nombre })), 
  [pacientes]);

  const medicoOptions = useMemo(() => 
    medicos.map(m => ({ value: m.id, label: m.nombre })), 
  [medicos]);

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '10px',
      borderColor: state.isFocused ? 'var(--ins-primary)' : '#e2e8f0',
      minHeight: '45px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(236, 78, 83, 0.1)' : 'none',
      '&:hover': { borderColor: 'var(--ins-primary)' }
    })
  };

  const resetForm = () => {
    setSelectedPacienteId(pacienteId || "");
    setSelectedMedicoId("");
    setEditDetalle("");
  };

  // Filtrado
  const filteredHistorias = useMemo(() => {
    const historiasArray = Array.isArray(historias) ? historias : historias ? [historias] : [];
    return historiasArray
      .filter(h => !pacienteId || h.id_paciente === Number(pacienteId))
      .filter(h => h.detalle?.toUpperCase().includes(searchTerm.toUpperCase()));
  }, [historias, searchTerm, pacienteId]);

  const totalPages = Math.ceil(filteredHistorias.length / itemsPerPage);
  const currentHistorias = filteredHistorias.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPacienteNombre = (id) => pacientes.find(p => p.id === id)?.nombre || "Paciente no encontrado";
  const getMedicoNombre = (id) => medicos.find(m => m.id === id)?.nombre || "Médico no asignado";

  const openEditModal = (historia) => {
    setSelectedHistoria(historia);
    setSelectedPacienteId(historia.id_paciente);
    setSelectedMedicoId(historia.id_medico);
    setEditDetalle(historia.detalle);
    setIsEditModalOpen(true);
  };

  const handleCreate = async () => {
    if (!selectedPacienteId || !selectedMedicoId || !editDetalle) return;
    await createNewHistoria({
      id_paciente: Number(selectedPacienteId),
      id_medico: Number(selectedMedicoId),
      detalle: editDetalle
    });
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!selectedHistoria) return;
    await editedHistoria(selectedHistoria.id, {
      id_paciente: Number(selectedPacienteId),
      id_medico: Number(selectedMedicoId),
      detalle: editDetalle
    });
    setIsEditModalOpen(false);
    setSelectedHistoria(null);
    resetForm();
  };

  return (
    <div className="stories-view-container">
      {/* HEADER PRINCIPAL */}
      <div className="stories-main-header">
        <div>
          <h2 className="stories-title">Historias Clínicas</h2>
          <p className="stories-subtitle">
            {pacienteId ? `Registros de ${getPacienteNombre(Number(pacienteId))}` : `${filteredHistorias.length} registros totales`}
          </p>
        </div>
        <button className="stories-btn-primary" onClick={() => { resetForm(); setIsCreateModalOpen(true); }}>
          <Plus size={18} /> <span>Nueva Historia</span>
        </button>
      </div>

      {/* TOOLBAR BÚSQUEDA */}
      <div className="stories-filter-toolbar">
        <div className="stories-search-wrapper">
          <Search size={18} color="var(--ins-muted)" />
          <input
            type="text"
            className="stories-search-input"
            placeholder="Buscar por detalle clínico..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* LISTA DE REGISTROS */}
      <div className="stories-table-responsive">
        <table className="stories-data-table">
          <tbody>
            {currentHistorias.length > 0 ? currentHistorias.map(h => (
              <tr key={h.id} className="stories-table-row">
                <td className="stories-td-id">#{h.id}</td>
                
                <td>
                  <div className="ins-main-info">
                    <span className="ins-name" style={{fontSize: '0.95rem'}}>
                      {h.detalle.length > 80 ? `${h.detalle.substring(0, 80)}...` : h.detalle}
                    </span>
                    <div style={{display: 'flex', gap: '15px', marginTop: '4px'}}>
                        <span className="ins-subtext"><Stethoscope size={12}/> {getMedicoNombre(h.id_medico)}</span>
                        {!pacienteId && <span className="ins-subtext"><User size={12}/> {getPacienteNombre(h.id_paciente)}</span>}
                    </div>
                  </div>
                </td>

                <td className="stories-hide-mobile" style={{textAlign: 'right'}}>
                    <span className="ins-subtext">{new Date().toLocaleDateString()}</span>
                </td>

                <td>
                  <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                    <button className="stories-action-pill" onClick={() => openEditModal(h)}>
                      <Settings2 size={16} />
                      <span className="stories-hide-mobile">Detalles</span>
                    </button>
                    <button 
                        className="stories-action-pill" 
                        style={{color: 'var(--ins-danger)'}}
                        onClick={() => { setSelectedHistoria(h); setIsDeleteModalOpen(true); }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{textAlign: 'center', padding: '3rem', color: 'var(--ins-muted)'}}>
                  No hay historias clínicas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="stories-pagination-bar">
          <button className="stories-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft size={20} />
          </button>
          <span style={{fontWeight: 700}}>{currentPage} / {totalPages}</span>
          <button className="stories-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* MODAL CREAR / EDITAR REFINADO */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="stories-modal-overlay">
          <div className="stories-modal-card">
            <div className="stories-modal-header">
              <div className="stories-modal-title-group">
                <div className="stories-modal-icon-bg">
                  <FileText size={22} color="var(--ins-primary)" />
                </div>
                <div>
                  <h3 className="stories-modal-title" style={{margin: 0}}>
                    {isCreateModalOpen ? "Nueva Entrada Clínica" : "Editar Historia"}
                  </h3>
                  <p className="stories-modal-subtitle">Complete la información médica del paciente</p>
                </div>
              </div>
              <button className="stories-close-btn" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}>
                <X size={20} />
              </button>
            </div>

            <div className="stories-modal-grid">
              {/* Selector de Paciente */}
              <div className="ins-col-span-2">
                <label className="lp-modal-label">
                  <User size={14} /> Paciente
                </label>
                {!pacienteId ? (
                  <Select
                    options={pacienteOptions}
                    value={pacienteOptions.find(opt => opt.value === selectedPacienteId)}
                    onChange={(opt) => setSelectedPacienteId(opt?.value)}
                    styles={customSelectStyles}
                    placeholder="Buscar paciente..."
                  />
                ) : (
                  <input 
                    className="stories-modal-input stories-input-disabled" 
                    value={getPacienteNombre(Number(pacienteId))} 
                    disabled 
                  />
                )}
              </div>

              {/* Selector de Médico */}
              <div className="ins-col-span-2">
                <label className="lp-modal-label">
                  <Stethoscope size={14} /> Médico Tratante
                </label>
                <Select
                  options={medicoOptions}
                  value={medicoOptions.find(opt => opt.value === selectedMedicoId)}
                  onChange={(opt) => setSelectedMedicoId(opt?.value)}
                  styles={customSelectStyles}
                  placeholder="Seleccionar médico..."
                />
              </div>

              {/* Detalle Clínico */}
              <div className="ins-col-span-2">
                <label className="lp-modal-label">
                  <Pencil size={14} /> Detalle del Diagnóstico / Evolución
                </label>
                <textarea
                  className="stories-modal-input stories-textarea-clinical"
                  placeholder="Describa los hallazgos clínicos, síntomas y evolución..."
                  value={editDetalle}
                  onChange={(e) => setEditDetalle(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="stories-modal-footer">
              <button className="stories-btn-tertiary" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}>
                Cancelar
              </button>
              <button className="stories-btn-primary stories-btn-wide" onClick={isCreateModalOpen ? handleCreate : handleUpdate}>
                <Save size={18} /> {isCreateModalOpen ? "Registrar Historia" : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedHistoria && (
        <div className="stories-modal-overlay">
          <div className="stories-modal-card" style={{maxWidth: '400px', textAlign: 'center'}}>
            <div style={{color: 'var(--ins-danger)', marginBottom: '1rem'}}>
              <AlertTriangle size={48} style={{margin: '0 auto'}} />
            </div>
            <h3 className="stories-modal-title">¿Eliminar registro?</h3>
            <p>Se eliminará la historia <strong>#{selectedHistoria.id}</strong> de forma permanente.</p>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem'}}>
              <button className="stories-btn-danger" onClick={async () => { await deleteHistoriaById(selectedHistoria.id); setIsDeleteModalOpen(false); }}>
                Confirmar Eliminación
              </button>
              <button className="stories-btn-tertiary" onClick={() => setIsDeleteModalOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListStories;