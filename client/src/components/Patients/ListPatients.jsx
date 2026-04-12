import React, { useEffect, useState, useMemo } from "react";
import { useHealth } from "../../context/HealtContext";
import {
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Componentes UI
import PatientFormModal from "./ui/PatientFormModal";
import ModalDetailedPatient from "./ui/ModalDetailedPatient";
import ListStories from "./ListStories";

// Estilos
import "../../styles/components/ListPatients.css";

const ListPatients = ({ onClose }) => {
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
    const filtered = list.filter(
      (p) =>
        p.nombre.toUpperCase().includes(searchTerm.toUpperCase()) ||
        p.documento?.includes(searchTerm),
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
    currentPage * itemsPerPage,
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
          order: idx + 1,
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
    <div className="pac-container">
      {/* HEADER */}
      <div className="pac-header">
        <div className="pac-title-wrap">
          <h2>Pacientes</h2>
          <p>{filteredPacientes.length} registros en el sistema</p>
        </div>
        
        <div className="pac-header-actions">
          <button
            className="pac-btn-add"
            onClick={() => {
              setSelectedPaciente(null);
              setIsFormModalOpen(true);
            }}
          >
            <Plus size={18} /> Nuevo Paciente
          </button>

          {onClose && (
            <button 
              className="pac-btn-close" 
              onClick={onClose}
              title="Close component"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="pac-toolbar">
        <div className="pac-search-field">
          <Search size={18} className="pac-icon-muted" />
          <input
            placeholder="BUSCAR POR NOMBRE O DOCUMENTO..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value.toUpperCase());
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="pac-table-holder">
        <table className="pac-table">
          <thead>
            <tr>
              <th>ID</th>
              <th className="pac-text-left">Paciente</th>
              <th className="pac-hide-mobile">Seguro / Cobertura</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentPacientes.map((p) => (
              <tr key={p.id}>
                <td data-label="ID" className="pac-id-cell">
                  #{p.id}
                </td>
                <td data-label="Paciente" className="pac-text-left">
                  <div className="pac-user-info">
                    <span className="pac-main-name">
                      {p.nombre.toUpperCase()}
                    </span>
                    <span className="pac-sub-document">{p.documento}</span>
                  </div>
                </td>
                <td data-label="Seguro" className="pac-hide-mobile">
                  <span className="pac-tag">
                    {(
                      seguros.find((s) => s.id === p.id_seguro)?.nombre ||
                      "Particular"
                    ).toUpperCase()}
                  </span>
                </td>
                <td data-label="Acciones">
                  <button
                    className="pac-btn-options"
                    disabled={isLoadingDetails !== null}
                    onClick={() => handleOpenDetails(p.id)}
                  >
                    {isLoadingDetails === p.id ? (
                      <Loader2 size={16} className="pac-loading-spin" />
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
        <div className="pac-pagination">
          <button
            className="pac-page-arrow"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="pac-page-counter">
            Página <strong>{currentPage}</strong> de {totalPages}
          </div>
          <button
            className="pac-page-arrow"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
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
        onEdit={(p) => {
          setIsDetailsModalOpen(false);
          setSelectedPaciente(p);
          setIsFormModalOpen(true);
        }}
        onDelete={() => setIsDeleteModalOpen(true)}
        onViewStories={() => setIsStoriesModalOpen(true)}
      />

      {/* Modal de Eliminación */}
      {isDeleteModalOpen && (
        <div className="pac-modal-overlay">
          <div className="pac-modal-content sm">
            <div className="pac-modal-header-danger">
              <AlertTriangle size={32} />
              <h3>Eliminar registro</h3>
            </div>
            <div className="pac-modal-body">
              <p>
                Esta acción eliminará permanentemente a{" "}
                <strong>{selectedPaciente?.nombre.toUpperCase()}</strong>.
              </p>
            </div>
            <div className="pac-modal-footer">
              <button
                className="pac-btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button className="pac-btn-danger" onClick={handleDeleteConfirm}>
                <Trash2 size={16} /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historias Clínicas */}
      {isStoriesModalOpen && (
        <div className="pac-modal-overlay">
          <div className="pac-modal-content lg">
            <div className="pac-modal-body">
              <ListStories pacienteId={selectedPaciente?.id} />
            </div>
            <div className="pac-modal-footer">
              <button
                className="pac-btn-secondary"
                onClick={() => setIsStoriesModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPatients;
