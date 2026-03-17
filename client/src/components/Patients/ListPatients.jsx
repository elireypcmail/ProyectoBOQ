import React, { useEffect, useState, useMemo } from "react";
import { useHealth } from "../../context/HealtContext";
import { 
  Search, Plus, Trash2, AlertTriangle, Loader2, 
  ChevronLeft, ChevronRight 
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Componentes UI
import PatientFormModal from "./ui/PatientFormModal";
import ModalDetailedPatient from "./ui/ModalDetailedPatient";
import ListStories from "./ListStories";

// Estilos
import "../../styles/components/ListPatients.css";

const ListPatients = () => {
  const {
    pacientes,
    seguros,
    getAllPacientes,
    getPacienteById,
    getAllMedicos,
    getAllSeguros,
    createNewPaciente,
    editedPaciente,
    deletePacienteById,
    saveFilesPaciente,
    createNewSeguro, 
  } = useHealth();

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStoriesModalOpen, setIsStoriesModalOpen] = useState(false);
  
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(null);

  useEffect(() => {
    getAllPacientes();
    getAllMedicos();
    getAllSeguros();
  }, []);

  // Filtrado y Ordenación Alfabética
  const filteredPacientes = useMemo(() => {
    const list = pacientes || [];
    
    // 1. Filtrar por nombre o documento
    const filtered = list.filter((p) =>
      p.nombre.toUpperCase().includes(searchTerm.toUpperCase()) ||
      p.documento?.includes(searchTerm)
    );

    // 2. Ordenar alfabéticamente por nombre
    return [...filtered].sort((a, b) => {
      const nameA = (a.nombre || "").toUpperCase();
      const nameB = (b.nombre || "").toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }, [pacientes, searchTerm]);

  const totalPages = Math.ceil(filteredPacientes.length / itemsPerPage);
  const currentPacientes = filteredPacientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- HANDLERS ---
  const handleOpenDetails = async (id) => {
    setIsLoadingDetails(id);
    try {
      const res = await getPacienteById(id);
      const pacienteData = res?.data || res; 
      setSelectedPaciente(pacienteData);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Error al obtener detalles:", error);
    } finally {
      setIsLoadingDetails(null);
    }
  };

  const handleSavePaciente = async (payload, archivos) => {
    setIsSaving(true);
    try {
      let pacienteId = null;
      if (selectedPaciente) {
        await editedPaciente(selectedPaciente.id, payload);
        pacienteId = selectedPaciente.id;
      } else {
        const res = await createNewPaciente(payload);
        pacienteId = res?.data?.id || res?.id || res?.data?.data?.id;
      }

      if (archivos?.length > 0 && pacienteId) {
        const filesJson = archivos.map((f, idx) => ({ 
          id: null, 
          name: f.name.toUpperCase(), 
          order: idx + 1 
        }));
        await saveFilesPaciente(pacienteId, archivos, filesJson);
      }

      setIsFormModalOpen(false);
      await getAllPacientes();
    } catch (error) {
      console.error("Error al guardar paciente:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSeguro = async (payload) => {
    try {
      const res = await createNewSeguro({ ...payload, estatus: true });
      await getAllSeguros();
      return res?.data || res;
    } catch (error) {
      console.error("Error al crear seguro:", error);
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPaciente) return;
    try {
      await deletePacienteById(selectedPaciente.id);
      setIsDeleteModalOpen(false);
      await getAllPacientes();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="lpa-container">
      {/* HEADER */}
      <div className="lpa-header">
        <div className="lpa-title-section">
          <h2>Pacientes</h2>
          <p>{filteredPacientes.length} registros encontrados</p>
        </div>
        <button 
          className="lpa-btn-primary" 
          onClick={() => { setSelectedPaciente(null); setIsFormModalOpen(true); }}
        >
          <Plus size={18} /> Nuevo Paciente
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="lpa-toolbar">
        <div className="lpa-search-box">
          <Search size={18} className="lpa-search-icon" />
          <input 
            placeholder="BUSCAR POR NOMBRE O DOCUMENTO..." 
            value={searchTerm} 
            style={{ textTransform: 'uppercase' }}
            onChange={(e) => { 
              setSearchTerm(e.target.value.toUpperCase()); 
              setCurrentPage(1); 
            }} 
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="lpa-table-wrapper">
        <table className="lpa-table">
          <thead>
            <tr>
              <th>ID</th>
              <th className="lpa-text-left">Paciente</th>
              <th className="lpa-hide-mobile">Seguro / Cobertura</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentPacientes.map((p) => (
              <tr key={p.id}>
                <td className="lpa-col-id">#{p.id}</td>
                <td className="lpa-text-left">
                  <div className="lpa-patient-info">
                    <span className="lpa-name">{p.nombre.toUpperCase()}</span>
                    <span className="lpa-subtext">{p.documento}</span>
                  </div>
                </td>
                <td className="lpa-hide-mobile">
                  <span className="lpa-badge">
                    {(seguros.find((s) => s.id === p.id_seguro)?.nombre || "Particular").toUpperCase()}
                  </span>
                </td>
                <td>
                  <button 
                    className="lpa-icon-btn" 
                    disabled={isLoadingDetails !== null}
                    onClick={() => handleOpenDetails(p.id)}
                  >
                    {isLoadingDetails === p.id ? (
                      <Loader2 size={16} className="lpa-spin" />
                    ) : (
                      <SlOptionsVertical size={16} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="lpa-pagination">
          <button 
            className="lpa-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="lpa-page-info">Página {currentPage} de {totalPages}</span>
          <button 
            className="lpa-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODALES */}
      <PatientFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSavePaciente}
        paciente={selectedPaciente}
        seguros={seguros}
        onCreateSeguro={handleCreateSeguro}
        isSaving={isSaving}
      />

      <ModalDetailedPatient
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        paciente={selectedPaciente}
        seguros={seguros}
        onEdit={(p) => { setIsDetailsModalOpen(false); setSelectedPaciente(p); setIsFormModalOpen(true); }}
        onDelete={() => setIsDeleteModalOpen(true)}
        onViewStories={() => setIsStoriesModalOpen(true)}
      />

      {/* Modal de Eliminación */}
      {isDeleteModalOpen && (
        <div className="lpa-modal-overlay">
          <div className="lpa-modal-content sm">
            <div className="lpa-modal-header-danger">
              <AlertTriangle size={32} />
              <h3>¿Eliminar registro?</h3>
            </div>
            <p className="lpa-modal-text">
              Esta acción eliminará permanentemente a <strong>{selectedPaciente?.nombre.toUpperCase()}</strong>.
            </p>
            <div className="lpa-modal-footer">
              <button className="lpa-btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="lpa-btn-danger" onClick={handleDeleteConfirm}>
                <Trash2 size={16} /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historias Clínicas */}
      {isStoriesModalOpen && (
        <div className="lpa-modal-overlay">
          <div className="lpa-modal-content wide"> 
            <ListStories pacienteId={selectedPaciente?.id} />
            <div className="lpa-modal-footer">
              <button className="lpa-btn-secondary" onClick={() => setIsStoriesModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPatients;