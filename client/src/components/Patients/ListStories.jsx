import React, { useEffect, useState, useMemo } from "react";
import { useHealth } from "../../context/HealtContext";
// 1. Importar Select
import Select from "react-select";
import {
  Search,
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  Plus
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import "../../styles/components/ModalList.css";

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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

  // 2. Mapear opciones para react-select
  const pacienteOptions = useMemo(() => 
    pacientes.map(p => ({ value: p.id, label: p.nombre })), 
  [pacientes]);

  const medicoOptions = useMemo(() => 
    medicos.map(m => ({ value: m.id, label: m.nombre })), 
  [medicos]);

  // Estilos personalizados para que coincida con tu CSS (opcional)
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      marginBottom: '1rem',
      borderRadius: '8px',
      borderColor: '#e2e8f0',
      minHeight: '45px'
    })
  };

  const resetForm = () => {
    setSelectedPacienteId(pacienteId || "");
    setSelectedMedicoId("");
    setEditDetalle("");
  };

  // -------------------- Filtrado --------------------
  const filteredHistorias = useMemo(() => {
    const historiasArray = Array.isArray(historias) ? historias : historias ? [historias] : [];
    return historiasArray
      .filter(h => !pacienteId || h.id_paciente === Number(pacienteId))
      .filter(h => h.detalle?.toUpperCase().includes(searchTerm.toUpperCase()));
  }, [historias, searchTerm, pacienteId]);

  const currentHistorias = filteredHistorias.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------- Acciones --------------------
  const openEditModal = (historia) => {
    setSelectedHistoria(historia);
    setSelectedPacienteId(historia.id_paciente);
    setSelectedMedicoId(historia.id_medico);
    setEditDetalle(historia.detalle);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (historia) => {
    setSelectedHistoria(historia);
    setIsDeleteModalOpen(true);
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
    pacienteId ? getHistoriasByPacientes(pacienteId) : getAllHistorias();
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
    pacienteId ? getHistoriasByPacientes(pacienteId) : getAllHistorias();
  };

  const handleDelete = async () => {
    if (!selectedHistoria) return;
    await deleteHistoriaById(selectedHistoria.id);
    setIsDeleteModalOpen(false);
    setSelectedHistoria(null);
    pacienteId ? getHistoriasByPacientes(pacienteId) : getAllHistorias();
  };

  const getPacienteNombre = (id) => pacientes.find(p => p.id === id)?.nombre || "-";
  const getMedicoNombre = (id) => medicos.find(m => m.id === id)?.nombre || "-";

  return (
    <div className="story-layout">
      {/* ... (Cabecera y toolbar se mantienen igual) ... */}
      <div className="story-header">
        <div>
          <h2>
            Historias Clínicas{" "}
            {pacienteId && `de ${getPacienteNombre(Number(pacienteId))}`}
          </h2>
          <p>Total historias: {filteredHistorias.length}</p>
        </div>
      </div>

      <div className="story-toolbar">
        <div className="story-search-group">
          <Search size={16} />
          <input
            placeholder="Buscar por detalle..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <button
          className="story-btn story-btn-primary"
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        >
          <Plus size={16} /> Nueva Historia
        </button>
      </div>

      <div className="story-table-container">
        <table className="story-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Médico</th>
              <th>Detalle</th>
              <th className="story-align-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentHistorias.length ? (
              currentHistorias.map(h => (
                <tr key={h.id}>
                  <td>#{h.id}</td>
                  <td>{getMedicoNombre(h.id_medico)}</td>
                  <td>{h.detalle}</td>
                  <td className="story-align-center">
                    <button
                      className="story-icon-action"
                      onClick={() => {
                        setSelectedHistoria(h);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <SlOptionsVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="story-no-results">
                  No se encontraron historias
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR / EDITAR */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="story-modal-backdrop">
          <div className="story-modal-panel">
            <h3>
              {isCreateModalOpen ? "Crear Historia Clínica" : "Editar Historia Clínica"}
            </h3>

            {/* 3. Reemplazo del selector de Paciente */}
            {!pacienteId ? (
              <Select
                className="story-select-container"
                placeholder="Selecciona un paciente..."
                options={pacienteOptions}
                value={pacienteOptions.find(opt => opt.value === selectedPacienteId)}
                onChange={(option) => setSelectedPacienteId(option ? option.value : "")}
                styles={customSelectStyles}
                isSearchable
              />
            ) : (
              <input
                className="story-input-field"
                value={getPacienteNombre(Number(pacienteId))}
                disabled
              />
            )}

            {/* 4. Reemplazo del selector de Médico */}
            <Select
              className="story-select-container"
              placeholder="Selecciona el médico referido..."
              options={medicoOptions}
              value={medicoOptions.find(opt => opt.value === selectedMedicoId)}
              onChange={(option) => setSelectedMedicoId(option ? option.value : "")}
              styles={customSelectStyles}
              isSearchable
            />

            <textarea
              className="story-input-field story-textarea"
              placeholder="Detalle clínico"
              value={editDetalle}
              onChange={(e) => setEditDetalle(e.target.value.toUpperCase())}
            />

            <div className="story-modal-actions">
              <button
                className="story-btn story-btn-secondary"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </button>
              <button
                className="story-btn story-btn-primary"
                onClick={isCreateModalOpen ? handleCreate : handleUpdate}
              >
                <Save size={16} /> {isCreateModalOpen ? "Crear" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ... (Resto de modales se mantienen igual) ... */}
      {/* MODAL DETALLE */}
      {isDetailsModalOpen && selectedHistoria && (
        <div className="story-modal-backdrop">
          <div className="story-modal-panel">
            <h3>Historia #{selectedHistoria.id}</h3>
            <div className="story-details-card">
              <div><strong>Paciente:</strong> {getPacienteNombre(selectedHistoria.id_paciente)}</div>
              <div><strong>Médico:</strong> {getMedicoNombre(selectedHistoria.id_medico)}</div>
              <div><strong>Detalle:</strong> {selectedHistoria.detalle}</div>
            </div>
            <div className="story-modal-actions" style={{ flexDirection: "column" }}>
              <button className="story-btn story-btn-primary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedHistoria); }}>
                <Pencil size={16} /> Editar
              </button>
              <button className="story-btn story-btn-danger" onClick={() => { setIsDetailsModalOpen(false); openDeleteModal(selectedHistoria); }}>
                <Trash2 size={16} /> Eliminar
              </button>
              <button className="story-btn story-btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedHistoria && (
        <div className="story-modal-backdrop">
          <div className="story-modal-panel">
            <div className="story-alert-header">
              <AlertTriangle size={28} />
              <h3>¿Eliminar historia clínica?</h3>
            </div>
            <p>Esta acción no se puede deshacer</p>
            <div className="story-modal-actions">
              <button className="story-btn story-btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="story-btn story-btn-danger" onClick={handleDelete}>
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListStories;