import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useHealth } from "../../context/HealtContext";
import {
  Search, ChevronLeft, ChevronRight, Pencil, Trash2,
  AlertTriangle, Plus, User, Stethoscope, FileText, Loader2
} from "lucide-react";
import "../../styles/components/ListStories.css";
import ModalDetailedHistory from "./ui/ModalDetailedHistory";
import HistoryFormModal from "./ui/HistoryFormModal";

const ListStories = ({ pacienteId }) => {
  const {
    historias, pacientes, medicos,
    getAllHistorias, getAllPacientes, getAllMedicos,
    createNewHistoria, editedHistoria, deleteHistoriaById,
    getHistoriasByPacientes, saveFilesHistoria
  } = useHealth();

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const itemsPerPage = 6;

  // Modals State
  const [selectedHistoria, setSelectedHistoria] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // FIXED: Synchronized data loading
  useEffect(() => {
    const loadAllData = async () => {
      setIsInitialLoading(true);
      try {
        await Promise.all([
          getAllPacientes(),
          getAllMedicos(),
          pacienteId ? getHistoriasByPacientes(pacienteId) : getAllHistorias()
        ]);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadAllData();
  }, [pacienteId]);

  const pacienteOptions = useMemo(() => 
    pacientes.map(p => ({ value: p.id, label: p.nombre })), 
  [pacientes]);

  const medicoOptions = useMemo(() => 
    medicos.map(m => ({ value: m.id, label: m.nombre })), 
  [medicos]);

  const handleSaveHistoria = async (formData) => {
    try {
      let historiaId = null;
      const payload = {
        id_paciente: formData.id_paciente,
        id_medico: formData.id_medico,
        detalle: formData.detalle
      };

      if (selectedHistoria) {
        await editedHistoria(selectedHistoria.id, payload);
        historiaId = selectedHistoria.id;
      } else {
        const res = await createNewHistoria(payload);
        historiaId = res?.data?.data?.id || res?.id || res?.data?.id;
      }

      if (formData.files.length > 0 && historiaId) {
        const filesJson = formData.files.map((f, idx) => ({ id: null, name: f.name, order: idx + 1 }));
        await saveFilesHistoria(historiaId, formData.files, filesJson);
      }

      setIsFormModalOpen(false);
      setSelectedHistoria(null);
      pacienteId ? getHistoriasByPacientes(pacienteId) : getAllHistorias();
    } catch (error) {
      console.error("Error al guardar la historia:", error);
    }
  };

  const filteredHistorias = useMemo(() => {
    const historiasArray = Array.isArray(historias) ? historias : historias ? [historias] : [];
    return historiasArray
      .filter(h => !pacienteId || h.id_paciente === Number(pacienteId))
      .filter(h => h.detalle?.toUpperCase().includes(searchTerm.toUpperCase()));
  }, [historias, searchTerm, pacienteId]);

  const totalPages = Math.ceil(filteredHistorias.length / itemsPerPage);
  const currentHistorias = filteredHistorias.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPacienteNombre = (id) => pacientes.find(p => p.id === id)?.nombre || "---";
  const getMedicoNombre = (id) => medicos.find(m => m.id === id)?.nombre || "---";

  if (isInitialLoading) {
    return (
      <div className="stories-loading-screen">
        <Loader2 className="animate-spin" size={40} color="var(--ins-primary)" />
        <p>Cargando historias clínicas...</p>
      </div>
    );
  }

  return (
    <div className="stories-view-container">
      {/* HEADER */}
      <div className="stories-main-header">
        <div>
          <h2 className="stories-title">Historias Clínicas</h2>
          <p className="stories-subtitle">
            {pacienteId ? `Registros de ${getPacienteNombre(Number(pacienteId))}` : `${filteredHistorias.length} registros totales`}
          </p>
        </div>
        <button className="stories-btn-primary" onClick={() => { setSelectedHistoria(null); setIsFormModalOpen(true); }}>
          <Plus size={18} /> <span>Nueva Historia</span>
        </button>
      </div>

      {/* TOOLBAR */}
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

      {/* TABLE */}
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
                <td style={{ width: '180px' }}>
                  <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                    <button className="stories-action-pill" onClick={() => { setSelectedHistoria(h); setIsViewModalOpen(true); }}>
                      <FileText size={16} />
                      <span className="stories-hide-mobile">Detalles</span>
                    </button>

                    <button className="stories-action-pill" onClick={() => { setSelectedHistoria(h); setIsFormModalOpen(true); }}>
                      <Pencil size={16} />
                      <span className="stories-hide-mobile">Editar</span>
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
                <td colSpan="4" className="stories-empty-state">No se encontraron historias clínicas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
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

      {/* MODALS */}
      <HistoryFormModal 
        isOpen={isFormModalOpen}
        onClose={() => { setIsFormModalOpen(false); setSelectedHistoria(null); }}
        onSave={handleSaveHistoria}
        pacienteId={pacienteId}
        pacienteOptions={pacienteOptions}
        medicoOptions={medicoOptions}
        initialData={selectedHistoria}
        getPacienteNombre={getPacienteNombre}
      />

      {isViewModalOpen && selectedHistoria && (
        <ModalDetailedHistory 
          isOpen={isViewModalOpen}
          historia={selectedHistoria}
          onClose={() => { setIsViewModalOpen(false); setSelectedHistoria(null); }}
        />
      )}

      {isDeleteModalOpen && selectedHistoria && createPortal(
        <div className="stories-modal-overlay">
          <div className="stories-modal-card modal-delete-confirm">
            <div className="delete-icon-wrapper"><AlertTriangle size={48} /></div>
            <h3 className="stories-modal-title">¿Eliminar registro?</h3>
            <p>Estás a punto de eliminar la historia <strong>#{selectedHistoria.id}</strong> permanentemente.</p>
            <div className="delete-actions-container">
              <button className="stories-btn-danger" onClick={async () => { await deleteHistoriaById(selectedHistoria.id); setIsDeleteModalOpen(false); }}>Eliminar</button>
              <button className="stories-btn-tertiary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ListStories;